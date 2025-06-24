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
        // No initialization needed for now
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
        if (password.length() < 6) {
            showAlert(Alert.AlertType.ERROR, "Password must be at least 6 characters!");
            return;
        }

        showAlert(Alert.AlertType.INFORMATION, "Login successful! (MySQL integration pending)");
        clearFields();
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
        alert.getDialogPane().getStyleClass().add("glass-container");
        alert.showAndWait();
    }
}