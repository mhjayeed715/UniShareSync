package unisharesync.ui;

import java.net.URL;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ResourceBundle;
import javafx.application.Platform;
import javafx.beans.property.StringProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import javafx.geometry.Insets;

public class ResourceController implements Initializable {

    @FXML
    private Button menuButton;
    @FXML
    private Label roleLabel;
    @FXML
    private Button announcementsButton;
    @FXML
    private Button resourcesButton;
    @FXML
    private Button projectsButton;
    @FXML
    private Button profileButton;
    @FXML
    private Button logoutButton;
    @FXML
    private Button adminDashboardButton;
    @FXML
    private TextField searchResourceField;
    @FXML
    private Button searchResourceButton;
    @FXML
    private TableView<ResourceTab> resourcesTable;
    @FXML
    private TableColumn<ResourceTab, String> resourceTitleCol;
    @FXML
    private TableColumn<ResourceTab, String> resourceFileCol;
    @FXML
    private TableColumn<ResourceTab, String> resourceTimestampCol;
    @FXML
    private TableColumn<ResourceTab, Void> viewDetailsCol;
    @FXML
    private HBox editControls;
    @FXML
    private TextField addResourceTitleField;
    @FXML
    private TextField addResourceFilePathField;
    @FXML
    private Button addResourceFileButton;
    @FXML
    private Button addResourceButton;
    @FXML
    private TextField updateResourceTitleField;
    @FXML
    private TextField updateResourceFilePathField;
    @FXML
    private Button updateResourceFileButton;
    @FXML
    private Button updateResourceButton;
    @FXML
    private Button deleteResourceButton;
    @FXML
    private Button viewResourcesButton;

    private String currentEmail;
    private boolean isAdmin = false;
    private boolean isFaculty = false;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        resourceTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        resourceFileCol.setCellValueFactory(new PropertyValueFactory<>("filePath"));
        resourceTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
        setupViewDetailsColumn();
        loadUserRole();
        viewResources();
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email;
        if (currentEmail != null) {
            loadUserRole();
            viewResources();
            updateRoleBasedVisibility();
        }
    }

    private void loadUserRole() {
        if (currentEmail == null) return;
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT role, is_admin FROM users WHERE email = ? OR name = ?")) {
            stmt.setString(1, currentEmail);
            stmt.setString(2, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String role = rs.getString("role");
                    isAdmin = rs.getBoolean("is_admin");
                    isFaculty = "faculty".equalsIgnoreCase(role);
                    String roleText = isAdmin ? "Admin" : isFaculty ? "Faculty" : "Student";
                    roleLabel.setText("Role: " + roleText);
                    adminDashboardButton.setVisible(isAdmin);
                    updateRoleBasedVisibility();
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load user role: " + e.getMessage());
        }
    }

    @FXML
    private void goToAnnouncements(ActionEvent event) {
        navigateTo("/unisharesync/ui/announcement.fxml");
    }

    @FXML
    private void goToResources(ActionEvent event) {
        navigateTo("/unisharesync/ui/resource.fxml");
    }

    @FXML
    private void goToProjects(ActionEvent event) {
        navigateTo("/unisharesync/ui/project.fxml");
    }

    @FXML
    private void goToProfile(ActionEvent event) {
        navigateTo("/unisharesync/ui/profile.fxml");
    }

    @FXML
    private void handleLogout(ActionEvent event) {
        navigateTo("/unisharesync/ui/login.fxml");
    }

    @FXML
    private void goToAdminDashboard(ActionEvent event) {
        navigateTo("/unisharesync/ui/admin_dashboard.fxml");
    }

    @FXML
    private void searchResources() {
        String searchTerm = searchResourceField.getText().trim();
        ObservableList<ResourceTab> resources = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT title, file_path, created_at FROM resources WHERE title LIKE ? ORDER BY created_at DESC")) {
            stmt.setString(1, "%" + searchTerm + "%");
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    String filePath = rs.getString("file_path") != null ? rs.getString("file_path") : "";
                    resources.add(new ResourceTab(rs.getString("title"), createdAt, filePath));
                }
            }
            resourcesTable.setItems(resources);
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to search resources: " + e.getMessage());
        }
    }

    @FXML
    private void viewResources() {
        searchResourceField.clear();
        searchResources();
    }

    @FXML
    private void uploadResourceFile(ActionEvent event) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Files", "*.pdf", "*.png", "*.jpg", "*.jpeg"));
        File file = fileChooser.showOpenDialog(menuButton.getScene().getWindow());
        if (file != null) {
            try {
                String destPath = "src/main/resources/uploads/" + file.getName();
                Files.copy(file.toPath(), new File(destPath).toPath(), StandardCopyOption.REPLACE_EXISTING);
                addResourceFilePathField.setText(destPath);
            } catch (Exception e) {
                showAlert("Error", "Failed to upload file: " + e.getMessage());
            }
        }
    }

    @FXML
    private void uploadUpdateResourceFile(ActionEvent event) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Files", "*.pdf", "*.png", "*.jpg", "*.jpeg"));
        File file = fileChooser.showOpenDialog(menuButton.getScene().getWindow());
        if (file != null) {
            try {
                String destPath = "src/main/resources/uploads/" + file.getName();
                Files.copy(file.toPath(), new File(destPath).toPath(), StandardCopyOption.REPLACE_EXISTING);
                updateResourceFilePathField.setText(destPath);
            } catch (Exception e) {
                showAlert("Error", "Failed to upload file: " + e.getMessage());
            }
        }
    }

    @FXML
    private void addResource(ActionEvent event) {
        if (!isAdmin) {
            showAlert("Access Denied", "Only admins can add resources!");
            return;
        }
        String title = addResourceTitleField.getText().trim();
        String filePath = addResourceFilePathField.getText().trim();
        if (title.isEmpty()) {
            showAlert("Error", "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO resources (title, file_path, user_id) VALUES (?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, filePath.isEmpty() ? null : filePath);
            stmt.setInt(3, getCurrentUserId());
            stmt.executeUpdate();
            showAlert("Success", "Resource added successfully!");
            clearResourceFields();
            viewResources();
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to add resource: " + e.getMessage());
        }
    }

    @FXML
    private void updateResource(ActionEvent event) {
        if (!isAdmin) {
            showAlert("Access Denied", "Only admins can update resources!");
            return;
        }
        String title = updateResourceTitleField.getText().trim();
        String filePath = updateResourceFilePathField.getText().trim();
        if (title.isEmpty()) {
            showAlert("Error", "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE resources SET file_path = ? WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, filePath.isEmpty() ? getResourceField(title, "file_path") : filePath);
            stmt.setString(2, title);
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Resource updated successfully!");
                clearResourceFields();
                viewResources();
            } else {
                showAlert("Error", "No resource found with the given title.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update resource: " + e.getMessage());
        }
    }

    @FXML
    private void deleteResource(ActionEvent event) {
        if (!isAdmin) {
            showAlert("Access Denied", "Only admins can delete resources!");
            return;
        }
        ResourceTab selectedResource = resourcesTable.getSelectionModel().getSelectedItem();
        if (selectedResource == null) {
            showAlert("Error", "Please select a resource to delete.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "DELETE FROM resources WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, selectedResource.getTitle());
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Resource deleted successfully!");
                viewResources();
            } else {
                showAlert("Error", "Failed to delete resource.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to delete resource: " + e.getMessage());
        }
    }

    private void setupViewDetailsColumn() {
        viewDetailsCol.setCellFactory(param -> new TableCell<ResourceTab, Void>() {
            private final Button viewButton = new Button("View");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    viewButton.setOnAction(event -> {
                        ResourceTab resource = getTableView().getItems().get(getIndex());
                        showResourceDetails(resource);
                    });
                    setGraphic(viewButton);
                }
            }
        });
    }

    private void showResourceDetails(ResourceTab resource) {
        Stage popup = new Stage();
        VBox vbox = new VBox(10);
        vbox.setPadding(new Insets(10));
        vbox.getStyleClass().add("popup-content");

        Label titleLabel = new Label(resource.getTitle());
        titleLabel.getStyleClass().add("popup-title");
        Label timestampLabel = new Label("Posted on: " + resource.getCreatedAt());
        timestampLabel.getStyleClass().add("popup-timestamp");
        Label fileLabel = new Label("File: " + (resource.getFilePath() != null ? resource.getFilePath() : "None"));
        fileLabel.getStyleClass().add("popup-timestamp");
        Button closeButton = new Button("Close");
        closeButton.setOnAction(e -> popup.close());

        vbox.getChildren().addAll(titleLabel, timestampLabel, fileLabel, closeButton);
        Scene scene = new Scene(vbox, 400, 300);
        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        popup.setScene(scene);
        popup.setTitle("Resource Details");
        popup.show();
    }

    private String getResourceField(String title, String field) throws SQLException {
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT " + field + " FROM resources WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString(field) != null ? rs.getString(field) : "";
                }
            }
        }
        return "";
    }

    private int getCurrentUserId() throws SQLException {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ? OR name = ?")) {
            stmt.setString(1, currentEmail);
            stmt.setString(2, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }
        throw new SQLException("User not found for email: " + currentEmail);
    }

    private void clearResourceFields() {
        addResourceTitleField.clear();
        addResourceFilePathField.clear();
        updateResourceTitleField.clear();
        updateResourceFilePathField.clear();
    }

    private void updateRoleBasedVisibility() {
        boolean isEditable = isAdmin;
        editControls.setVisible(isEditable);
        editControls.setManaged(isEditable);
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) menuButton.getScene().getWindow();
        if (stage.getScene() == null) {
            showAlert("Error", "Scene is not initialized");
            return;
        }
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                URL resource = getClass().getResource(fxmlPath);
                if (resource == null) {
                    throw new IllegalStateException("FXML resource not found: " + fxmlPath);
                }
                System.out.println("Loading FXML from: " + resource);
                FXMLLoader loader = new FXMLLoader(resource);
                AnchorPane root = loader.load();
                Object controller = loader.getController();
                if (controller instanceof Initializable) {
                    if (controller instanceof AnnouncementController) {
                        ((AnnouncementController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ResourceController) {
                        ((ResourceController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof DashboardController) {
                        ((DashboardController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AdminDashboardController) {
                        ((AdminDashboardController) controller).setCurrentEmail(currentEmail);
                    }
                }
                Scene scene = new Scene(root, 1000, 600);
                scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                stage.setScene(scene);
                stage.getScene().getRoot().setOpacity(1);
            } catch (Exception e) {
                showAlert("Error", "Failed to navigate: " + e.getMessage());
            }
        });
    }

    @FXML
    private void toggleMenu(ActionEvent event) {
        System.out.println("Toggle menu clicked");
        VBox sidebar = (VBox) menuButton.getScene().getRoot().lookup(".sidebar");
        if (sidebar != null) {
            sidebar.setVisible(!sidebar.isVisible());
            AnchorPane content = (AnchorPane) menuButton.getScene().getRoot().lookup(".content-area");
            if (sidebar.isVisible()) {
                sidebar.toFront();
                content.setStyle("-fx-left-anchor: 200.0;");
            } else {
                content.setStyle("-fx-left-anchor: 0.0;");
            }
        } else {
            System.out.println("Sidebar not found");
        }
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    public static class ResourceTab {
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty createdAt = new SimpleStringProperty();
        private final StringProperty filePath = new SimpleStringProperty();

        public ResourceTab(String title, String createdAt, String filePath) {
            this.title.set(title);
            this.createdAt.set(createdAt);
            this.filePath.set(filePath);
        }

        public String getTitle() { return title.get(); }
        public String getCreatedAt() { return createdAt.get(); }
        public String getFilePath() { return filePath.get(); }

        public StringProperty titleProperty() { return title; }
        public StringProperty createdAtProperty() { return createdAt; }
        public StringProperty filePathProperty() { return filePath; }
    }
}