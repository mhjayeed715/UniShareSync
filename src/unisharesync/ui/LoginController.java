package unisharesync.ui;

import java.net.URL;
import java.util.ResourceBundle;
import java.util.regex.Pattern;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class LoginController implements Initializable {

    @FXML
    private AnchorPane rootPane;
    @FXML
    private TextField emailField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private Button loginButton;
    @FXML
    private Hyperlink signupLink;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
    }    

    @FXML
    private void handleLogin() {
        System.out.println("Login button clicked");
        String email = emailField.getText().trim();
        String password = passwordField.getText();

        if (email.isEmpty() || password.isEmpty()) {
            showAlert(Alert.AlertType.ERROR, "All fields are required!");
            return;
        }
        if (!isValidEmail(email)) {
            showAlert(Alert.AlertType.ERROR, "Invalid email format!");
            return;
        }

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            stmt.setString(2, password); // Note: In production, hash passwords
            rs = stmt.executeQuery();
            if (rs.next()) {
                showAlert(Alert.AlertType.INFORMATION, "Login successful!");
                clearFields();
            } else {
                showAlert(Alert.AlertType.ERROR, "Invalid email or password!");
            }
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Database error: " + e.getMessage());
        } finally {
            if (conn != null) try { conn.close(); } catch (SQLException e) {}
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    @FXML
    private void goToSignup() {
        System.out.println("Signup link clicked");
        Stage stage = (Stage) signupLink.getScene().getWindow();
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/unisharesync/ui/signup.fxml"));
                Scene scene = new Scene(loader.load(), 1000, 600);
                scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                stage.setScene(scene);
                stage.getScene().getRoot().setOpacity(1);
            } catch (Exception e) {
                showAlert(Alert.AlertType.ERROR, "Navigation failed: " + e.getMessage());
            }
        });
    }
    
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(email).matches();
    }

    private void clearFields() {
        emailField.clear();
        passwordField.clear();
    }

    private void showAlert(Alert.AlertType type, String message) {
        Alert alert = new Alert(type, message);
        alert.setTitle("UniShareSync");
        alert.setHeaderText(null);
        alert.getDialogPane().getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        alert.getDialogPane().getStyleClass().add("glass-container"); // Changed to glass-container
        alert.showAndWait();
    }
}