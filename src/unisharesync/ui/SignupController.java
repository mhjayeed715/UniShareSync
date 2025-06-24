package unisharesync.ui;

import java.net.URL;
import java.util.ResourceBundle;
import java.util.regex.Pattern;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;
import javafx.fxml.Initializable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class SignupController implements Initializable {

    @FXML
    private AnchorPane rootPane;
    @FXML
    private TextField nameField;
    @FXML
    private TextField emailField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private ComboBox<String> roleComboBox;
    @FXML
    private Button signupButton;
    @FXML
    private Hyperlink loginLink;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        roleComboBox.getItems().addAll("Student", "Faculty", "Admin");
        roleComboBox.setPromptText("Select Role");
    }    

    @FXML
    private void handleSignup() {
        System.out.println("Signup button clicked");
        String name = nameField.getText().trim();
        String email = emailField.getText().trim();
        String password = passwordField.getText();
        String role = roleComboBox.getValue();

        if (name.isEmpty() || email.isEmpty() || password.isEmpty() || role == null) {
            showAlert(Alert.AlertType.ERROR, "All fields are required!");
            return;
        }
        if (!isValidEmail(email)) {
            showAlert(Alert.AlertType.ERROR, "Invalid email format!");
            return;
        }
        if (password.length() < 6) {
            showAlert(Alert.AlertType.ERROR, "Password must be at least 6 characters!");
            return;
        }

        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, password); // Note: In production, hash passwords
            stmt.setString(4, role);
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                showAlert(Alert.AlertType.INFORMATION, "Signup successful!");
                clearFields();
            }
        } catch (SQLException e) {
            if (e.getMessage().contains("Duplicate entry")) {
                showAlert(Alert.AlertType.ERROR, "Email already registered!");
            } else {
                showAlert(Alert.AlertType.ERROR, "Database error: " + e.getMessage());
            }
        } finally {
            if (conn != null) try { conn.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    @FXML
    private void goToLogin() {
        System.out.println("Login link clicked");
        Stage stage = (Stage) loginLink.getScene().getWindow();
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/unisharesync/ui/login.fxml"));
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
        nameField.clear();
        emailField.clear();
        passwordField.clear();
        roleComboBox.setValue(null);
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