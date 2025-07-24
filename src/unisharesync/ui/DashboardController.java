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
    @FXML private Label roleLabel;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button logoutButton;
    @FXML private Label welcomeLabel;
    @FXML private Button addAnnouncementButton;
    @FXML private Label resourcesStatLabel;
    @FXML private Label projectsStatLabel;
    @FXML private Label announcementsStatLabel;
    @FXML private VBox activityFeedVBox;
    @FXML private Button uploadResourceButton;
    @FXML private Button viewTasksButton;

    private String currentEmail;
    private boolean isAdmin = false;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("DashboardController: Initialized");
        if (menuButton != null) System.out.println("DashboardController: menuButton found");
        if (currentEmail != null) {
            loadWelcomeData();
            loadStats();
            loadActivityFeed();
            checkAdminRedirect();
        }
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email != null ? email.trim().toLowerCase() : null;
        System.out.println("DashboardController: Current email set to: " + currentEmail);
        loadUserRole();
        loadWelcomeData();
        loadStats();
        loadActivityFeed();
        updateRoleBasedVisibility();
        checkAdminRedirect();
    }

    @FXML
    private void toggleMenu(ActionEvent event) {
        System.out.println("DashboardController: Toggle menu clicked");
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
            System.out.println("DashboardController: Sidebar visibility set to: " + sidebar.isVisible());
        } else {
            System.out.println("DashboardController: Sidebar not found");
        }
    }

    @FXML
    private void goToAnnouncements(ActionEvent event) {
        System.out.println("DashboardController: Navigate to Announcements");
        navigateTo("/unisharesync/ui/announcement.fxml");
    }

    @FXML
    private void goToResources(ActionEvent event) {
        System.out.println("DashboardController: Navigate to Resources");
        navigateTo("/unisharesync/ui/resource.fxml");
    }

    @FXML
    private void goToProjects(ActionEvent event) {
        System.out.println("DashboardController: Navigate to Projects");
        navigateTo("/unisharesync/ui/project.fxml");
    }

    @FXML
    private void goToProfile(ActionEvent event) {
        System.out.println("DashboardController: Navigate to Profile");
        navigateTo("/unisharesync/ui/profile.fxml");
    }

    @FXML
    private void handleLogout(ActionEvent event) {
        System.out.println("DashboardController: Logout clicked");
        navigateTo("/unisharesync/ui/login.fxml");
    }

    @FXML
    private void addAnnouncement(ActionEvent event) {
        if (isAdmin) {
            showAlert(Alert.AlertType.INFORMATION, "Add Announcement functionality to be implemented in Week 3.");
        } else {
            showAlert(Alert.AlertType.WARNING, "Only admins can add announcements!");
        }
    }

    @FXML
    private void uploadResource(ActionEvent event) {
        if (isAdmin) {
            showAlert(Alert.AlertType.INFORMATION, "Upload Resource functionality to be implemented in Week 3.");
        } else {
            showAlert(Alert.AlertType.WARNING, "Only admins can upload resources!");
        }
    }

    @FXML
    private void viewTasks(ActionEvent event) {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        StringBuilder tasks = new StringBuilder();
        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT title, description, status FROM tasks WHERE user_id = (SELECT id FROM users WHERE email = ?)";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, currentEmail);
            rs = stmt.executeQuery();
            while (rs.next()) {
                tasks.append("Title: ").append(rs.getString("title"))
                     .append(", Description: ").append(rs.getString("description"))
                     .append(", Status: ").append(rs.getString("status")).append("\n");
            }
            showAlert(Alert.AlertType.INFORMATION, tasks.length() > 0 ? tasks.toString() : "No tasks found.");
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Failed to view tasks: " + e.getMessage());
            System.out.println("DashboardController: viewTasks SQLException - " + e.getMessage());
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private void loadUserRole() {
        if (currentEmail == null) {
            roleLabel.setText("Role: Not Logged In");
            System.out.println("DashboardController: loadUserRole - No currentEmail");
            return;
        }
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT role, is_admin FROM users WHERE email = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, currentEmail);
            rs = stmt.executeQuery();
            if (rs.next()) {
                String role = rs.getString("role");
                isAdmin = rs.getBoolean("is_admin");
                roleLabel.setText("Role: " + (role != null ? role : "User") + (isAdmin ? " (Admin)" : ""));
                System.out.println("DashboardController: loadUserRole - Role: " + role + ", isAdmin: " + isAdmin);
            } else {
                roleLabel.setText("Role: Unknown");
                System.out.println("DashboardController: loadUserRole - No user found for email: " + currentEmail);
            }
        } catch (SQLException e) {
            roleLabel.setText("Role: Error");
            showAlert(Alert.AlertType.ERROR, "Role load failed: " + e.getMessage());
            System.out.println("DashboardController: loadUserRole SQLException - " + e.getMessage());
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private void loadWelcomeData() {
        if (currentEmail == null || welcomeLabel == null) {
            System.out.println("DashboardController: loadWelcomeData - No currentEmail or welcomeLabel");
            return;
        }
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT name FROM users WHERE email = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, currentEmail);
            rs = stmt.executeQuery();
            String userName = rs.next() ? rs.getString("name") : "User";
            int announcementsCount = getNewAnnouncementsCount();
            int tasksCount = getPendingTasksCount();
            welcomeLabel.setText("👋 Welcome, " + userName + "!");
            VBox welcomeVBox = (VBox) welcomeLabel.getParent();
            if (welcomeVBox != null && welcomeVBox.getChildren().size() > 1) {
                Label statsLabel = (Label) welcomeVBox.getChildren().get(1);
                statsLabel.setText("You have " + announcementsCount + " new announcements and " + tasksCount + " pending tasks.");
            }
            System.out.println("DashboardController: loadWelcomeData - Name: " + userName + ", Announcements: " + announcementsCount + ", Tasks: " + tasksCount);
        } catch (SQLException e) {
            welcomeLabel.setText("👋 Welcome, User!");
            VBox welcomeVBox = (VBox) welcomeLabel.getParent();
            if (welcomeVBox != null && welcomeVBox.getChildren().size() > 1) {
                Label statsLabel = (Label) welcomeVBox.getChildren().get(1);
                statsLabel.setText("Loading stats failed.");
            }
            System.out.println("DashboardController: loadWelcomeData SQLException - " + e.getMessage());
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private void loadStats() {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            if (conn == null) {
                throw new SQLException("Database connection is null");
            }
            stmt = conn.prepareStatement("SELECT COUNT(*) FROM resources WHERE user_id = (SELECT id FROM users WHERE email = ?)");
            stmt.setString(1, currentEmail);
            rs = stmt.executeQuery();
            rs.next();
            resourcesStatLabel.setText(rs.getInt(1) + " Available");
            System.out.println("DashboardController: Resources count: " + rs.getInt(1));

            stmt = conn.prepareStatement("SELECT COUNT(*) FROM project_memberships WHERE user_id = (SELECT id FROM users WHERE email = ?)");
            stmt.setString(1, currentEmail);
            rs = stmt.executeQuery();
            rs.next();
            projectsStatLabel.setText(rs.getInt(1) + " Active");
            System.out.println("DashboardController: Projects count: " + rs.getInt(1));

            stmt = conn.prepareStatement("SELECT COUNT(*) FROM announcements WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)");
            rs = stmt.executeQuery();
            rs.next();
            announcementsStatLabel.setText(rs.getInt(1) + " New");
            System.out.println("DashboardController: Announcements count: " + rs.getInt(1));
        } catch (SQLException e) {
            resourcesStatLabel.setText("0 Available");
            projectsStatLabel.setText("0 Active");
            announcementsStatLabel.setText("0 New");
            showAlert(Alert.AlertType.ERROR, "Stats load failed: " + e.getMessage());
            System.out.println("DashboardController: loadStats SQLException - " + e.getMessage());
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private void loadActivityFeed() {
        activityFeedVBox.getChildren().clear();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT a.title AS announcement, r.title AS resource, p.title AS project, pm.joined_at " +
                        "FROM announcements a " +
                        "LEFT JOIN resources r ON a.user_id = r.user_id " +
                        "LEFT JOIN project_memberships pm ON a.user_id = pm.user_id " +
                        "LEFT JOIN projects p ON pm.project_id = p.id " +
                        "WHERE a.user_id = (SELECT id FROM users WHERE email = ?) " +
                        "OR r.user_id = (SELECT id FROM users WHERE email = ?) " +
                        "OR pm.user_id = (SELECT id FROM users WHERE email = ?) " +
                        "ORDER BY COALESCE(a.created_at, r.created_at, pm.joined_at) DESC LIMIT 3";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, currentEmail);
            stmt.setString(2, currentEmail);
            stmt.setString(3, currentEmail);
            rs = stmt.executeQuery();
            boolean hasData = false;
            while (rs.next()) {
                String announcement = rs.getString("announcement");
                String resource = rs.getString("resource");
                String project = rs.getString("project");
                if (announcement != null) {
                    activityFeedVBox.getChildren().add(new Label("📢 New Announcement: " + announcement));
                    hasData = true;
                } else if (resource != null) {
                    activityFeedVBox.getChildren().add(new Label("📁 New Resource: " + resource));
                    hasData = true;
                } else if (project != null) {
                    activityFeedVBox.getChildren().add(new Label("👥 Project Update: Added to " + project));
                    hasData = true;
                }
            }
            if (!hasData) {
                activityFeedVBox.getChildren().add(new Label("No recent activity found."));
            }
            System.out.println("DashboardController: loadActivityFeed - Loaded activity feed");
        } catch (SQLException e) {
            activityFeedVBox.getChildren().add(new Label("Failed to load activity feed."));
            showAlert(Alert.AlertType.ERROR, "Activity feed load failed: " + e.getMessage());
            System.out.println("DashboardController: loadActivityFeed SQLException - " + e.getMessage());
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private int getNewAnnouncementsCount() {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            stmt = conn.prepareStatement("SELECT COUNT(*) FROM announcements WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)");
            rs = stmt.executeQuery();
            rs.next();
            int count = rs.getInt(1);
            System.out.println("DashboardController: getNewAnnouncementsCount - Count: " + count);
            return count;
        } catch (SQLException e) {
            System.out.println("DashboardController: getNewAnnouncementsCount SQLException - " + e.getMessage());
            return 0;
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private int getPendingTasksCount() {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            stmt = conn.prepareStatement("SELECT COUNT(*) FROM tasks WHERE user_id = (SELECT id FROM users WHERE email = ?) AND status = 'pending'");
            stmt.setString(1, currentEmail);
            rs = stmt.executeQuery();
            rs.next();
            int count = rs.getInt(1);
            System.out.println("DashboardController: getPendingTasksCount - Count: " + count);
            return count;
        } catch (SQLException e) {
            System.out.println("DashboardController: getPendingTasksCount SQLException - " + e.getMessage());
            return 0;
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private void updateRoleBasedVisibility() {
        if (addAnnouncementButton != null) {
            addAnnouncementButton.setVisible(isAdmin);
        }
        if (uploadResourceButton != null) {
            uploadResourceButton.setVisible(isAdmin);
        }
        System.out.println("DashboardController: updateRoleBasedVisibility - addAnnouncementButton: " + (addAnnouncementButton != null ? addAnnouncementButton.isVisible() : "null") + ", uploadResourceButton: " + (uploadResourceButton != null ? uploadResourceButton.isVisible() : "null"));
    }

    private void checkAdminRedirect() {
        if (isAdmin && !getClass().getSimpleName().equals("AdminDashboardController")) {
            System.out.println("DashboardController: Redirecting admin to admin_dashboard.fxml");
            navigateTo("/unisharesync/ui/admin_dashboard.fxml");
        }
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) menuButton.getScene().getWindow();
        if (stage.getScene() == null) {
            showAlert(Alert.AlertType.ERROR, "Scene is not initialized");
            System.out.println("DashboardController: navigateTo - Scene is not initialized");
            return;
        }
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                URL resource = getClass().getResource(fxmlPath);
                if (resource == null) {
                    throw new IllegalStateException("FXML resource not found: " + fxmlPath);
                }
                System.out.println("DashboardController: Loading FXML from: " + resource);
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
                System.out.println("DashboardController: Navigated to " + fxmlPath);
            } catch (Exception e) {
                showAlert(Alert.AlertType.ERROR, "Navigation failed: " + e.getMessage());
                System.out.println("DashboardController: navigateTo Exception - " + e.getMessage());
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