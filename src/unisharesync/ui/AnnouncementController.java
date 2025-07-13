package unisharesync.ui;

import java.net.URL;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ResourceBundle;
import javafx.application.Platform;
import javafx.beans.property.IntegerProperty;
import javafx.beans.property.SimpleIntegerProperty;
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
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class AnnouncementController implements Initializable {

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
    private TextField searchAnnouncementField;
    @FXML
    private Button searchAnnouncementButton;
    @FXML
    private TableView<AnnouncementTab> announcementsTable;
    @FXML
    private TableColumn<AnnouncementTab, String> announcementTitleCol;
    @FXML
    private TableColumn<AnnouncementTab, String> announcementContentCol;
    @FXML
    private TableColumn<AnnouncementTab, Integer> announcementPriorityCol;
    @FXML
    private Button viewAnnouncementsButton;

    private String currentEmail;
    private boolean isAdmin = false;
    private boolean isFaculty = false;
    @FXML
    private HBox editControls;
    @FXML
    private TextField addAnnouncementTitleField;
    @FXML
    private TextField addAnnouncementContentField;
    @FXML
    private Button addAnnouncementButton;
    @FXML
    private TextField updateAnnouncementTitleField;
    @FXML
    private TextField updateAnnouncementContentField;
    @FXML
    private Button updateAnnouncementButton;
    @FXML
    private Button deleteAnnouncementButton;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        announcementTitleCol.setCellValueFactory(cellData -> cellData.getValue().titleProperty());
        announcementContentCol.setCellValueFactory(cellData -> cellData.getValue().contentProperty());
        announcementPriorityCol.setCellValueFactory(cellData -> cellData.getValue().priorityProperty().asObject());
        loadUserRole();
        viewAnnouncements();
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email;
        if (currentEmail != null) {
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
                }
            }
        } catch (SQLException e) {
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
             PreparedStatement stmt = conn.prepareStatement("SELECT title, content, priority FROM announcements WHERE title LIKE ?")) {
            stmt.setString(1, "%" + searchTerm + "%");
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    announcements.add(new AnnouncementTab(rs.getString("title"), rs.getString("content"), rs.getInt("priority")));
                }
            }
            announcementsTable.setItems(announcements);
        } catch (SQLException e) {
            showAlert("Error", "Failed to search announcements: " + e.getMessage());
        }
    }

    @FXML
    private void viewAnnouncements() {
        searchAnnouncementField.clear();
        searchAnnouncements();
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

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
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

    @FXML
    private void addAnnouncement(ActionEvent event) {
        if (!isAdmin) {
            showAlert("Access Denied", "Only admins can add announcements!");
            return;
        }
        String title = addAnnouncementTitleField.getText().trim();
        String content = addAnnouncementContentField.getText().trim();
        if (title.isEmpty() || content.isEmpty()) {
            showAlert("Error", "Title and content are required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO announcements (title, content, priority) VALUES (?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, content);
            stmt.setInt(3, 1); // Default priority
            stmt.executeUpdate();
            showAlert("Success", "Announcement added successfully!");
            clearAnnouncementFields();
            viewAnnouncements();
        } catch (SQLException e) {
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
        if (title.isEmpty()) {
            showAlert("Error", "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE announcements SET content = ? WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, content.isEmpty() ? getAnnouncementField(title, "content") : content);
            stmt.setString(2, title);
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Announcement updated successfully!");
                clearAnnouncementFields();
                viewAnnouncements();
            } else {
                showAlert("Error", "No announcement found with the given title.");
            }
        } catch (SQLException e) {
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
            showAlert("Error", "Failed to delete announcement: " + e.getMessage());
        }
    }

    private String getAnnouncementField(String title, String field) throws SQLException {
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT " + field + " FROM announcements WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString(field);
                }
            }
        }
        return "";
    }

    private void clearAnnouncementFields() {
        addAnnouncementTitleField.clear();
        addAnnouncementContentField.clear();
        updateAnnouncementTitleField.clear();
        updateAnnouncementContentField.clear();
    }

    private void updateRoleBasedVisibility() {
        boolean isEditable = isAdmin;
        editControls.setVisible(isEditable);
        editControls.setManaged(isEditable); 
    }

    public static class AnnouncementTab {
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty content = new SimpleStringProperty();
        private final IntegerProperty priority = new SimpleIntegerProperty();

        public AnnouncementTab(String title, String content, int priority) {
            this.title.set(title);
            this.content.set(content);
            this.priority.set(priority);
        }

        public String getTitle() { return title.get(); }
        public String getContent() { return content.get(); }
        public int getPriority() { return priority.get(); }
        
        public StringProperty titleProperty() { return title; }
        public StringProperty contentProperty() { return content; }
        public IntegerProperty priorityProperty() { return priority; }
    }
}