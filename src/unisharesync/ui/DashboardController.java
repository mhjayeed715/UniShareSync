package unisharesync.ui;

import java.net.URL;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ResourceBundle;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class DashboardController implements Initializable {

    @FXML private Button menuButton;
    @FXML private VBox sidebar;
    @FXML private AnchorPane contentArea;
    @FXML private Label roleLabel;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button logoutButton;
    @FXML private Label welcomeLabel;
    @FXML private Label welcomeStatsLabel;
    @FXML private Button addAnnouncementButton;
    @FXML private Button uploadResourceButton;
    @FXML private Button viewTasksButton;
    @FXML private Label announcementsCountLabel;
    @FXML private Label resourcesCountLabel;
    @FXML private Label projectsCountLabel;
    @FXML private VBox activityFeedVBox;

    private String currentEmail;
    private boolean isAdmin = false;
    private boolean isFaculty = false;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        if (currentEmail != null) {
            loadUserData();
        }
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email != null ? email.trim().toLowerCase() : null;
        loadUserData();
    }

    @FXML
    private void toggleMenu(ActionEvent event) {
        boolean isVisible = !sidebar.isVisible();
        sidebar.setVisible(isVisible);
        AnchorPane.setLeftAnchor(contentArea, isVisible ? 200.0 : 0.0);
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
        currentEmail = null;
        navigateTo("/unisharesync/ui/login.fxml");
    }

    @FXML
    private void addAnnouncement(ActionEvent event) {
        if (isAdmin || isFaculty) {
            navigateTo("/unisharesync/ui/announcement.fxml");
        } else {
            showAlert(Alert.AlertType.WARNING, "Only admins and faculty can add announcements!");
        }
    }

    @FXML
    private void uploadResource(ActionEvent event) {
        if (isAdmin || isFaculty) {
            navigateTo("/unisharesync/ui/resource.fxml");
        } else {
            showAlert(Alert.AlertType.WARNING, "Only admins and faculty can upload resources!");
        }
    }

    @FXML
    private void viewTasks(ActionEvent event) {
        navigateTo("/unisharesync/ui/project.fxml");
    }

    private void loadUserData() {
        if (currentEmail == null) {
            setDefaultLabels();
            return;
        }
        
        loadUserRole();
        loadWelcomeData();
        loadStatistics();
        loadActivityFeed();
        updateRoleBasedVisibility();
    }

    private void loadUserRole() {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT name, role, is_admin FROM users WHERE email = ?")) {
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String role = rs.getString("role");
                    isAdmin = rs.getInt("is_admin") == 1;
                    isFaculty = "faculty".equalsIgnoreCase(role);
                    
                    String displayRole = role != null ? role : "student";
                    if (isAdmin) displayRole = "Admin";
                    
                    roleLabel.setText("Role: " + displayRole);
                } else {
                    roleLabel.setText("Role: Unknown");
                }
            }
        } catch (SQLException e) {
            roleLabel.setText("Role: Error");
            showAlert(Alert.AlertType.ERROR, "Failed to load user role: " + e.getMessage());
        }
    }

    private void loadWelcomeData() {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT name FROM users WHERE email = ?")) {
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                String userName = rs.next() ? rs.getString("name") : "User";
                welcomeLabel.setText("👋 Welcome, " + userName + "!");
                
                int announcementsCount = getRecentAnnouncementsCount();
                int pendingTasksCount = getPendingTasksCount();
                int activeProjectsCount = getActiveProjectsCount();
                
                welcomeStatsLabel.setText(String.format("You have %d recent announcements, %d pending tasks, and %d active projects.", 
                    announcementsCount, pendingTasksCount, activeProjectsCount));
            }
        } catch (SQLException e) {
            welcomeLabel.setText("👋 Welcome, User!");
            welcomeStatsLabel.setText("Unable to load statistics.");
        }
    }

    private void loadStatistics() {
        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM announcements WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                int count = rs.getInt(1);
                announcementsCountLabel.setText(count + " New This Week");
            }

            stmt = conn.prepareStatement("SELECT COUNT(*) FROM resources");
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                int count = rs.getInt(1);
                resourcesCountLabel.setText(count + " Available");
            }

            stmt = conn.prepareStatement("SELECT COUNT(*) FROM projects");
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                int count = rs.getInt(1);
                projectsCountLabel.setText(count + " Total");
            }
        } catch (SQLException e) {
            announcementsCountLabel.setText("Error");
            resourcesCountLabel.setText("Error");
            projectsCountLabel.setText("Error");
        }
    }

    private void loadActivityFeed() {
        activityFeedVBox.getChildren().clear();
        
        Label titleLabel = new Label("Latest Activity");
        titleLabel.getStyleClass().add("feed-title");
        titleLabel.setStyle("-fx-padding: 8 0 0 10;");
        activityFeedVBox.getChildren().add(titleLabel);

        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement(
                "SELECT 'announcement' as type, title, created_at FROM announcements " +
                "UNION ALL " +
                "SELECT 'resource' as type, title, created_at FROM resources " +
                "UNION ALL " +
                "SELECT 'project' as type, title, created_at FROM projects " +
                "ORDER BY created_at DESC LIMIT 5"
            );
            
            try (ResultSet rs = stmt.executeQuery()) {
                boolean hasActivity = false;
                while (rs.next()) {
                    hasActivity = true;
                    String type = rs.getString("type");
                    String title = rs.getString("title");
                    String icon = getIconForType(type);
                    
                    Label activityLabel = new Label(icon + " " + title);
                    activityLabel.getStyleClass().add("feed-item");
                    activityLabel.setStyle("-fx-padding: 2 0 2 5;");
                    activityFeedVBox.getChildren().add(activityLabel);
                }
                
                if (!hasActivity) {
                    Label noActivityLabel = new Label("No recent activity found.");
                    noActivityLabel.getStyleClass().add("feed-item");
                    noActivityLabel.setStyle("-fx-padding: 2 0 2 5;");
                    activityFeedVBox.getChildren().add(noActivityLabel);
                }
            }
        } catch (SQLException e) {
            Label errorLabel = new Label("Failed to load activity feed.");
            errorLabel.getStyleClass().add("feed-item");
            errorLabel.setStyle("-fx-padding: 2 0 2 5;");
            activityFeedVBox.getChildren().add(errorLabel);
        }
    }

    private String getIconForType(String type) {
        switch (type) {
            case "announcement": return "📢";
            case "resource": return "📁";
            case "project": return "👥";
            default: return "•";
        }
    }

    private int getRecentAnnouncementsCount() {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM announcements WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")) {
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            return 0;
        }
    }

    private int getPendingTasksCount() {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT COUNT(*) FROM tasks t " +
                 "JOIN group_memberships gm ON t.group_id = gm.group_id " +
                 "WHERE gm.user_id = (SELECT id FROM users WHERE email = ?) " +
                 "AND gm.status = 'accepted' AND t.status = 'pending'")) {
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            return 0;
        }
    }

    private int getActiveProjectsCount() {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT COUNT(DISTINCT p.id) FROM projects p " +
                 "JOIN project_groups pg ON p.id = pg.project_id " +
                 "JOIN group_memberships gm ON pg.group_id = gm.group_id " +
                 "WHERE gm.user_id = (SELECT id FROM users WHERE email = ?) " +
                 "AND gm.status = 'accepted'")) {
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            return 0;
        }
    }

    private void updateRoleBasedVisibility() {
        if (addAnnouncementButton != null) {
            addAnnouncementButton.setVisible(isAdmin || isFaculty);
        }
        if (uploadResourceButton != null) {
            uploadResourceButton.setVisible(isAdmin || isFaculty);
        }
    }

    private void setDefaultLabels() {
        welcomeLabel.setText("👋 Welcome, Guest!");
        welcomeStatsLabel.setText("Please log in to view your dashboard.");
        roleLabel.setText("Role: Guest");
        announcementsCountLabel.setText("0 New");
        resourcesCountLabel.setText("0 Available");
        projectsCountLabel.setText("0 Active");
        
        if (addAnnouncementButton != null) addAnnouncementButton.setVisible(false);
        if (uploadResourceButton != null) uploadResourceButton.setVisible(false);
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) menuButton.getScene().getWindow();
        if (stage.getScene() == null) {
            showAlert(Alert.AlertType.ERROR, "Scene is not initialized");
            return;
        }
        
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                URL resource = getClass().getResource(fxmlPath);
                if (resource == null) {
                    throw new IllegalStateException("FXML resource not found: " + fxmlPath);
                }
                
                FXMLLoader loader = new FXMLLoader(resource);
                AnchorPane root = loader.load();
                Object controller = loader.getController();
                
                if (controller instanceof Initializable) {
                    if (controller instanceof DashboardController) {
                        ((DashboardController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AnnouncementController) {
                        ((AnnouncementController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AdminDashboardController) {
                        ((AdminDashboardController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ProfileController) {
                        ((ProfileController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ProjectController) {
                        ((ProjectController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ResourceController) {
                        ((ResourceController) controller).setCurrentEmail(currentEmail);
                    }
                }
                
                Scene scene = new Scene(root, 1000, 600);
                scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                stage.setScene(scene);
                stage.getScene().getRoot().setOpacity(1);
            } catch (Exception e) {
                showAlert(Alert.AlertType.ERROR, "Navigation failed: " + e.getMessage());
            }
        });
    }

    private void showAlert(Alert.AlertType type, String message) {
        Alert alert = new Alert(type, message);
        alert.setTitle("UniShareSync");
        alert.setHeaderText(null);
        alert.getDialogPane().getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        alert.getDialogPane().getStyleClass().add("glass-background");
        alert.showAndWait();
    }
}
