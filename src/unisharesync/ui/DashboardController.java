package unisharesync.ui;

import java.net.URL;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ResourceBundle;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class DashboardController implements Initializable {

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

    private String currentEmail; 
    
    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // TODO
    }    

    @FXML
    private void toggleMenu(javafx.event.ActionEvent event) {
        System.out.println("Toggle menu clicked");
        VBox sidebar = (VBox) menuButton.getScene().getRoot().lookup(".sidebar");
        sidebar.setVisible(!sidebar.isVisible());
        AnchorPane content = (AnchorPane) menuButton.getScene().getRoot().lookup(".content-area");
        if (sidebar.isVisible()) {
            sidebar.toFront(); 
            content.setStyle("-fx-left-anchor: 200.0;");
        } else {
            content.setStyle("-fx-left-anchor: 0.0;");
        }
    }

    @FXML
    private void goToAnnouncements(javafx.event.ActionEvent event) {
        System.out.println("Navigate to Announcements");
        navigateTo("/unisharesync/ui/announcement.fxml"); 
    }

    @FXML
    private void goToResources(javafx.event.ActionEvent event) {
        System.out.println("Navigate to Resources");
        navigateTo("/unisharesync/ui/resource.fxml"); 
    }

    @FXML
    private void goToProjects(javafx.event.ActionEvent event) {
        System.out.println("Navigate to Projects");
        navigateTo("/unisharesync/ui/project.fxml"); 
    }

    @FXML
    private void goToProfile(javafx.event.ActionEvent event) {
        System.out.println("Navigate to Profile");
        navigateTo("/unisharesync/ui/profile.fxml");
    }

    @FXML
    private void handleLogout(javafx.event.ActionEvent event) {
        System.out.println("Logout clicked");
        Stage stage = (Stage) logoutButton.getScene().getWindow();
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/unisharesync/ui/login.fxml"));
                Scene scene = new Scene(loader.load(), 1000, 600);
                scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                stage.setScene(scene);
                stage.getScene().getRoot().setOpacity(1);
            } catch (Exception e) {
                showAlert(Alert.AlertType.ERROR, "Logout failed: " + e.getMessage());
            }
        });
    }
    
    
    public void setCurrentEmail(String email) {
        this.currentEmail = email;
        loadUserRole();
    }

    private void loadUserRole() {
        if (currentEmail == null) {
            roleLabel.setText("Role: Not Logged In");
            return;
        }
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT role, is_admin FROM users WHERE email = ? OR name = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, currentEmail);
            stmt.setString(2, currentEmail); 
            rs = stmt.executeQuery();
            if (rs.next()) {
                String role = rs.getString("role");
                boolean isAdmin = rs.getBoolean("is_admin");
                roleLabel.setText("Role: " + role + (isAdmin ? " (Admin)" : ""));
            } else {
                roleLabel.setText("Role: Unknown");
            }
        } catch (SQLException e) {
            roleLabel.setText("Role: Error");
            showAlert(Alert.AlertType.ERROR, "Role load failed: " + e.getMessage());
        } finally {
            if (conn != null) try { conn.close(); } catch (SQLException e) {}
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) resourcesButton.getScene().getWindow();
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));
                Scene scene = new Scene(loader.load(), 1000, 600);
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