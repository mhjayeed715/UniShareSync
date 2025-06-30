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
    private TextField loginField; 
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
        String loginInput = loginField.getText().trim();
        String password = passwordField.getText();

        if (loginInput.isEmpty() || password.isEmpty()) {
            showAlert(Alert.AlertType.ERROR, "All fields are required!");
            return;
        }
        if (!isValidEmail(loginInput) && !isValidName(loginInput)) {
            showAlert(Alert.AlertType.ERROR, "Invalid username or email format!");
            return;
        }

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT password, is_admin FROM users WHERE email = ? OR name = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, loginInput); 
            stmt.setString(2, loginInput); 
            rs = stmt.executeQuery();
            if(rs.next()){
                String hashedPassword = rs.getString("password");
                boolean isAdmin = rs.getBoolean("is_admin");
                if(DBUtil.checkPassword(password, hashedPassword)) {
                    showAlert(Alert.AlertType.INFORMATION, "Login successful! " + (isAdmin ? "Admin access granted." : ""));
                    clearFields();
                    Stage stage = (Stage) loginField.getScene().getWindow();
                    stage.getScene().getRoot().setOpacity(0);
                    Platform.runLater(() -> {
                        try{
                            FXMLLoader loader = new FXMLLoader(getClass().getResource("/unisharesync/ui/dashboard.fxml"));
                            Scene scene = new Scene(loader.load(), 1000, 600);
                            scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                            stage.setScene(scene);
                            stage.getScene().getRoot().setOpacity(1);
                        }catch (Exception e) {
                            showAlert(Alert.AlertType.ERROR, "Navigation failed: " + e.getMessage());
                        }
                    });
                }else{
                    showAlert(Alert.AlertType.ERROR, "Invalid username/email or password!");
                }
            }else{
                showAlert(Alert.AlertType.ERROR, "Invalid username/email or password!");
            }
        }catch(SQLException e){
            showAlert(Alert.AlertType.ERROR, "Database error: " + e.getMessage());
        }finally{
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
    
    private boolean isValidEmail(String input) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(input).matches();
    }

    private boolean isValidName(String input) {
        String nameRegex = "^[a-zA-Z\\s-]+$";
        return input.matches(nameRegex) && input.trim().length() >= 2;
    }

    private void clearFields() {
        loginField.clear();
        passwordField.clear();
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