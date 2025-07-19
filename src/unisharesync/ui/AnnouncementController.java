package unisharesync.ui;

import java.io.File;
import java.net.URL;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ResourceBundle;
import javafx.application.Platform;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.geometry.Insets;

public class AnnouncementController implements Initializable {

    @FXML private Button menuButton;
    @FXML private Label roleLabel;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button logoutButton;
    @FXML private Button adminDashboardButton;
    @FXML private TextField searchAnnouncementField;
    @FXML private Button searchAnnouncementButton;
    @FXML private TableView<AnnouncementTab> announcementsTable;
    @FXML private TableColumn<AnnouncementTab, String> announcementTitleCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementContentCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementTimestampCol;
    @FXML private TableColumn<AnnouncementTab, Void> viewDetailsCol;
    @FXML private HBox editControls;
    @FXML private TextField addAnnouncementTitleField;
    @FXML private TextField addAnnouncementContentField;
    @FXML private TextField addAnnouncementImagePathField;
    @FXML private TextField addAnnouncementPriorityField;
    @FXML private Button addAnnouncementButton;
    @FXML private TextField updateAnnouncementTitleField;
    @FXML private TextField updateAnnouncementContentField;
    @FXML private TextField updateAnnouncementImagePathField;
    @FXML private TextField updateAnnouncementPriorityField;
    @FXML private Button updateAnnouncementButton;
    @FXML private Button deleteAnnouncementButton;
    @FXML private Button viewAnnouncementsButton;

    private String currentEmail;
    private boolean isAdmin = false;
    private boolean isFaculty = false;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("AnnouncementController initializing...");
        announcementTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        announcementContentCol.setCellValueFactory(new PropertyValueFactory<>("contentSnippet"));
        announcementTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
        setupViewDetailsColumn();
        loadUserRole();
        viewAnnouncements();
        System.out.println("AnnouncementController initialized");
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email;
        if (currentEmail != null) {
            System.out.println("Setting current email: " + currentEmail);
            loadUserRole();
            viewAnnouncements();
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
                    System.out.println("User role loaded: " + roleText + ", isAdmin: " + isAdmin);
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
    private void searchAnnouncements() {
        String searchTerm = searchAnnouncementField.getText().trim();
        ObservableList<AnnouncementTab> announcements = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT title, content, created_at, image_path FROM announcements WHERE title LIKE ? ORDER BY created_at DESC")) {
            stmt.setString(1, "%" + searchTerm + "%");
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String content = rs.getString("content");
                    String snippet = content.length() > 100 ? content.substring(0, 100) + "..." : content;
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    String imagePath = rs.getString("image_path") != null ? rs.getString("image_path") : "";
                    announcements.add(new AnnouncementTab(rs.getString("title"), content, snippet, createdAt, imagePath));
                }
            }
            announcementsTable.setItems(announcements);
            System.out.println("Loaded " + announcements.size() + " announcements");
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to search announcements: " + e.getMessage());
        }
    }

    @FXML
    private void viewAnnouncements() {
        searchAnnouncementField.clear();
        searchAnnouncements();
    }

    @FXML
    private void addAnnouncement(ActionEvent event) {
        if (!isAdmin) {
            showAlert("Access Denied", "Only admins can add announcements!");
            return;
        }
        String title = addAnnouncementTitleField.getText().trim();
        String content = addAnnouncementContentField.getText().trim();
        String imagePath = addAnnouncementImagePathField.getText().trim();
        String priority = addAnnouncementPriorityField.getText().trim();
        if (title.isEmpty() || content.isEmpty()) {
            showAlert("Error", "Title and content are required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO announcements (title, content, image_path, user_id, priority) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, content);
            stmt.setString(3, imagePath.isEmpty() ? null : imagePath);
            stmt.setInt(4, getCurrentUserId());
            stmt.setString(5, priority.isEmpty() ? null : priority);
            stmt.executeUpdate();
            showAlert("Success", "Announcement added successfully!");
            clearAnnouncementFields();
            viewAnnouncements();
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to add announcement: " + e.getMessage());
        }
    }

    @FXML
    private void updateAnnouncement(ActionEvent event) {
        if (!isAdmin) {
            showAlert("Access Denied", "Only admins can update announcements!");
            return;
        }
        String title = updateAnnouncementTitleField.getText().trim();
        String content = updateAnnouncementContentField.getText().trim();
        String imagePath = updateAnnouncementImagePathField.getText().trim();
        String priority = updateAnnouncementPriorityField.getText().trim();
        if (title.isEmpty()) {
            showAlert("Error", "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE announcements SET content = ?, image_path = ?, priority = ? WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, content.isEmpty() ? getAnnouncementField(title, "content") : content);
            stmt.setString(2, imagePath.isEmpty() ? getAnnouncementField(title, "image_path") : imagePath);
            stmt.setString(3, priority.isEmpty() ? getAnnouncementField(title, "priority") : priority);
            stmt.setString(4, title);
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Announcement updated successfully!");
                clearAnnouncementFields();
                viewAnnouncements();
            } else {
                showAlert("Error", "No announcement found with the given title.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update announcement: " + e.getMessage());
        }
    }

    @FXML
    private void deleteAnnouncement(ActionEvent event) {
        if (!isAdmin) {
            showAlert("Access Denied", "Only admins can delete announcements!");
            return;
        }
        AnnouncementTab selectedAnnouncement = announcementsTable.getSelectionModel().getSelectedItem();
        if (selectedAnnouncement == null) {
            showAlert("Error", "Please select an announcement to delete.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "DELETE FROM announcements WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, selectedAnnouncement.getTitle());
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Announcement deleted successfully!");
                viewAnnouncements();
            } else {
                showAlert("Error", "Failed to delete announcement.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to delete announcement: " + e.getMessage());
        }
    }

    private void setupViewDetailsColumn() {
        System.out.println("Setting up viewDetailsCol");
        viewDetailsCol.setCellFactory(param -> new TableCell<AnnouncementTab, Void>() {
            private final Button viewButton = new Button("View");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                System.out.println("Updating viewDetailsCol cell, empty: " + empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    viewButton.setOnAction(event -> {
                        AnnouncementTab announcement = getTableView().getItems().get(getIndex());
                        showAnnouncementDetails(announcement);
                    });
                    setGraphic(viewButton);
                }
            }
        });
    }

    private void showAnnouncementDetails(AnnouncementTab announcement) {
        Stage popup = new Stage();
        VBox vbox = new VBox(10);
        vbox.setPadding(new Insets(10));
        vbox.getStyleClass().add("popup-content");

        Label titleLabel = new Label(announcement.getTitle());
        titleLabel.getStyleClass().add("popup-title");
        TextArea contentArea = new TextArea(announcement.getContent());
        contentArea.setEditable(false);
        contentArea.setWrapText(true);
        contentArea.setPrefHeight(200);
        Label timestampLabel = new Label("Posted on: " + announcement.getCreatedAt());
        timestampLabel.getStyleClass().add("popup-timestamp");
        ImageView imageView = new ImageView();
        if (announcement.getImagePath() != null && !announcement.getImagePath().isEmpty()) {
            try {
                imageView.setImage(new javafx.scene.image.Image(new File(announcement.getImagePath()).toURI().toString()));
                imageView.setFitWidth(200);
                imageView.setPreserveRatio(true);
            } catch (Exception e) {
                System.out.println("Failed to load image: " + e.getMessage());
            }
        }
        Button closeButton = new Button("Close");
        closeButton.setOnAction(e -> popup.close());

        vbox.getChildren().addAll(titleLabel, contentArea, timestampLabel, imageView, closeButton);
        Scene scene = new Scene(vbox, 400, 400);
        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        popup.setScene(scene);
        popup.setTitle("Announcement Details");
        popup.show();
    }

    private String getAnnouncementField(String title, String field) throws SQLException {
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT " + field + " FROM announcements WHERE title = ?";
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

    private void clearAnnouncementFields() {
        addAnnouncementTitleField.clear();
        addAnnouncementContentField.clear();
        addAnnouncementImagePathField.clear();
        addAnnouncementPriorityField.clear();
        updateAnnouncementTitleField.clear();
        updateAnnouncementContentField.clear();
        updateAnnouncementImagePathField.clear();
        updateAnnouncementPriorityField.clear();
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

    public static class AnnouncementTab {
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty content = new SimpleStringProperty();
        private final StringProperty contentSnippet = new SimpleStringProperty();
        private final StringProperty createdAt = new SimpleStringProperty();
        private final StringProperty imagePath = new SimpleStringProperty();

        public AnnouncementTab(String title, String content, String contentSnippet, String createdAt, String imagePath) {
            this.title.set(title);
            this.content.set(content);
            this.contentSnippet.set(contentSnippet);
            this.createdAt.set(createdAt);
            this.imagePath.set(imagePath);
        }

        public String getTitle() { return title.get(); }
        public String getContent() { return content.get(); }
        public String getContentSnippet() { return contentSnippet.get(); }
        public String getCreatedAt() { return createdAt.get(); }
        public String getImagePath() { return imagePath.get(); }

        public StringProperty titleProperty() { return title; }
        public StringProperty contentProperty() { return content; }
        public StringProperty contentSnippetProperty() { return contentSnippet; }
        public StringProperty createdAtProperty() { return createdAt; }
        public StringProperty imagePathProperty() { return imagePath; }
    }
}