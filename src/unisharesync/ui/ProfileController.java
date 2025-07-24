package unisharesync.ui;

import java.net.URL;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ResourceBundle;
import javafx.application.Platform;
import javafx.collections.FXCollections;
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

public class ProfileController implements Initializable {

    @FXML private Button menuButton;
    @FXML private VBox sidebar;
    @FXML private Label roleLabel;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button logoutButton;
    @FXML private Button adminDashboardButton;
    @FXML private AnchorPane contentArea;
    @FXML private VBox viewPane;
    @FXML private Label nameLabel;
    @FXML private Label emailLabel;
    @FXML private Label roleDisplayLabel;
    @FXML private VBox editPane;
    @FXML private TextField nameField;
    @FXML private TextField emailField;
    @FXML private PasswordField newPasswordField;
    @FXML private PasswordField confirmPasswordField;
    @FXML private HBox adminControls;
    @FXML private CheckBox isAdminCheckBox;
    @FXML private ComboBox<String> roleComboBox;
    @FXML private Button editButton;
    @FXML private Button saveButton;
    @FXML private Button cancelButton;

    private String currentEmail;
    private boolean isAdmin = false;
    private int currentUserId = -1;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("ProfileController: Initializing...");
        roleComboBox.setItems(FXCollections.observableArrayList("student", "faculty"));
        sidebar.setStyle("-fx-translate-z: 1;");
        System.out.println("ProfileController: Initialized, currentEmail=" + currentEmail);
        loadProfile();
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email != null ? email.trim().toLowerCase() : null;
        System.out.println("ProfileController: Current email set to: " + currentEmail);
        if (currentEmail != null && !currentEmail.isEmpty()) {
            loadProfile();
        } else {
            System.out.println("ProfileController: setCurrentEmail - Invalid or null email, skipping loadProfile");
        }
    }

    @FXML
    private void toggleMenu(ActionEvent event) {
        System.out.println("ProfileController: Toggling sidebar, current visibility: " + sidebar.isVisible());
        boolean isVisible = !sidebar.isVisible();
        sidebar.setVisible(isVisible);
        AnchorPane.setLeftAnchor(contentArea, isVisible ? 200.0 : 0.0);
        System.out.println("ProfileController: Sidebar visibility set to: " + isVisible + ", content left anchor: " + (isVisible ? 200.0 : 0.0));
    }


    @FXML
    private void goToAnnouncements(ActionEvent event) {
        System.out.println("ProfileController: Navigate to announcement.fxml");
        navigateTo("/unisharesync/ui/announcement.fxml");
    }

    @FXML
    private void goToResources(ActionEvent event) {
        System.out.println("ProfileController: Navigate to resource.fxml");
        navigateTo("/unisharesync/ui/resource.fxml");
    }

    @FXML
    private void goToProjects(ActionEvent event) {
        System.out.println("ProfileController: Navigate to project.fxml");
        navigateTo("/unisharesync/ui/project.fxml");
    }

    @FXML
    private void goToProfile(ActionEvent event) {
        System.out.println("ProfileController: Navigate to profile.fxml");
        navigateTo("/unisharesync/ui/profile.fxml");
    }

    @FXML
    private void handleLogout(ActionEvent event) {
        System.out.println("ProfileController: Logout clicked");
        currentEmail = null;
        navigateTo("/unisharesync/ui/login.fxml");
    }

    @FXML
    private void goToAdminDashboard(ActionEvent event) {
        if (isAdmin) {
            System.out.println("ProfileController: Navigate to admin_dashboard.fxml");
            navigateTo("/unisharesync/ui/admin_dashboard.fxml");
        } else {
            showAlert("Error", "Access denied: Admin privileges required.");
            System.out.println("ProfileController: goToAdminDashboard - Access denied for non-admin user, email: " + currentEmail);
        }
    }

    @FXML
    private void enableEditMode(ActionEvent event) {
        System.out.println("ProfileController: Entering edit mode");
        viewPane.setVisible(false);
        viewPane.setManaged(false);
        editPane.setVisible(true);
        editPane.setManaged(true);
        nameField.setText(nameLabel.getText());
        emailField.setText(emailLabel.getText());
        newPasswordField.clear();
        confirmPasswordField.clear();
        adminControls.setVisible(isAdmin);
        adminControls.setManaged(isAdmin);
        if (isAdmin) {
            String currentRole = roleDisplayLabel.getText().replace("Role: ", "");
            roleComboBox.setValue(currentRole.equals("Admin") ? "faculty" : currentRole);
            isAdminCheckBox.setSelected(isAdmin);
        }
        saveButton.setDisable(false);
    }

    @FXML
    private void cancelEdit(ActionEvent event) {
        System.out.println("ProfileController: Canceling edit mode");
        editPane.setVisible(false);
        editPane.setManaged(false);
        viewPane.setVisible(true);
        viewPane.setManaged(true);
        nameField.clear();
        emailField.clear();
        newPasswordField.clear();
        confirmPasswordField.clear();
        saveButton.setDisable(false);
    }

    @FXML
    private void saveProfile(ActionEvent event) {
        System.out.println("ProfileController: saveProfile - Starting save process");
        saveButton.setDisable(true);

        if (currentEmail == null || currentEmail.isEmpty()) {
            showAlert("Error", "Please log in to update your profile.");
            System.out.println("ProfileController: saveProfile - No currentEmail set");
            saveButton.setDisable(false);
            return;
        }

        String newName = nameField.getText().trim();
        String newEmail = emailField.getText().trim().toLowerCase();
        String newPassword = newPasswordField.getText();
        String confirmPassword = confirmPasswordField.getText();
        String newRole = isAdmin ? roleComboBox.getValue() : null;
        boolean newIsAdmin = isAdmin ? isAdminCheckBox.isSelected() : isAdmin;

        if (newName.isEmpty() || newEmail.isEmpty()) {
            showAlert("Error", "Name and email cannot be empty.");
            System.out.println("ProfileController: saveProfile - Empty name or email");
            saveButton.setDisable(false);
            return;
        }

        if (!newEmail.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            showAlert("Error", "Invalid email format.");
            System.out.println("ProfileController: saveProfile - Invalid email format: " + newEmail);
            saveButton.setDisable(false);
            return;
        }

        if (!newName.matches("^[a-zA-Z\\s-]+$") || newName.length() < 2) {
            showAlert("Error", "Invalid name format. Use letters, spaces, or hyphens, minimum 2 characters.");
            System.out.println("ProfileController: saveProfile - Invalid name format: " + newName);
            saveButton.setDisable(false);
            return;
        }

        if (!newPassword.isEmpty() || !confirmPassword.isEmpty()) {
            if (!newPassword.equals(confirmPassword)) {
                showAlert("Error", "Passwords do not match.");
                System.out.println("ProfileController: saveProfile - Passwords do not match");
                saveButton.setDisable(false);
                return;
            }
            if (newPassword.length() < 6) {
                showAlert("Error", "Password must be at least 6 characters long.");
                System.out.println("ProfileController: saveProfile - Password too short: " + newPassword.length());
                saveButton.setDisable(false);
                return;
            }
        }

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            System.out.println("ProfileController: saveProfile - Database connection established");
            stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ? AND id != ?");
            stmt.setString(1, newEmail);
            stmt.setInt(2, currentUserId);
            rs = stmt.executeQuery();
            if (rs.next()) {
                showAlert("Error", "Email is already in use by another user.");
                System.out.println("ProfileController: saveProfile - Email already taken: " + newEmail);
                saveButton.setDisable(false);
                return;
            }

            String sql;
            if (!newPassword.isEmpty()) {
                sql = isAdmin ?
                    "UPDATE users SET name = ?, email = ?, password = ?, role = ?, is_admin = ? WHERE id = ?" :
                    "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
            } else {
                sql = isAdmin ?
                    "UPDATE users SET name = ?, email = ?, role = ?, is_admin = ? WHERE id = ?" :
                    "UPDATE users SET name = ?, email = ? WHERE id = ?";
            }
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, newName);
            stmt.setString(2, newEmail);
            if (!newPassword.isEmpty()) {
                String hashedPassword = DBUtil.hashPassword(newPassword);
                stmt.setString(3, hashedPassword);
                if (isAdmin) {
                    stmt.setString(4, newRole);
                    stmt.setInt(5, newIsAdmin ? 1 : 0);
                    stmt.setInt(6, currentUserId);
                } else {
                    stmt.setInt(4, currentUserId);
                }
            } else {
                if (isAdmin) {
                    stmt.setString(3, newRole);
                    stmt.setInt(4, newIsAdmin ? 1 : 0);
                    stmt.setInt(5, currentUserId);
                } else {
                    stmt.setInt(3, currentUserId);
                }
            }
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Profile updated successfully.");
                currentEmail = newEmail;
                System.out.println("ProfileController: saveProfile - Updated user ID " + currentUserId + " with name: " + newName + ", email: " + newEmail + (newPassword.isEmpty() ? "" : ", password updated"));
                editPane.setVisible(false);
                editPane.setManaged(false);
                viewPane.setVisible(true);
                viewPane.setManaged(true);
                loadProfile();
            } else {
                showAlert("Error", "Failed to update profile.");
                System.out.println("ProfileController: saveProfile - No rows affected for user ID " + currentUserId);
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to update profile: " + e.getMessage());
            System.out.println("ProfileController: saveProfile SQLException - " + e.getMessage());
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
            saveButton.setDisable(false);
        }
    }

    private void loadProfile() {
        System.out.println("ProfileController: loadProfile - Attempting to load profile for email: " + currentEmail);
        if (currentEmail == null || currentEmail.isEmpty()) {
            roleLabel.setText("Role: Guest");
            nameLabel.setText("N/A");
            emailLabel.setText("N/A");
            roleDisplayLabel.setText("Role: Guest");
            adminControls.setVisible(false);
            adminControls.setManaged(false);
            adminDashboardButton.setVisible(false);
            viewPane.setVisible(true);
            viewPane.setManaged(true);
            editPane.setVisible(false);
            editPane.setManaged(false);
            System.out.println("ProfileController: loadProfile - No currentEmail, set to Guest");
            return;
        }

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            System.out.println("ProfileController: loadProfile - Database connection established");
            
            stmt = conn.prepareStatement("SELECT id, name, email, role, is_admin FROM users WHERE email = ?");
            stmt.setString(1, currentEmail);
            rs = stmt.executeQuery();
            if (rs.next()) {
                updateProfileFromResultSet(rs);
            } else {
                System.out.println("ProfileController: loadProfile - No user found for email: " + currentEmail);
                
                stmt = conn.prepareStatement("SELECT id, name, email, role, is_admin FROM users WHERE name = ?");
                stmt.setString(1, currentEmail); 
                rs = stmt.executeQuery();
                if (rs.next()) {
                    System.out.println("ProfileController: loadProfile - Found user by name: " + currentEmail);
                    updateProfileFromResultSet(rs);
                } else {
                    showAlert("Error", "User not found for email or name: " + currentEmail);
                    System.out.println("ProfileController: loadProfile - User not found for email or name: " + currentEmail);
                    setGuestMode();
                }
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to load profile: " + e.getMessage());
            System.out.println("ProfileController: loadProfile SQLException - " + e.getMessage());
            setGuestMode();
        } finally {
            DBUtil.closeConnection(conn);
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private void updateProfileFromResultSet(ResultSet rs) throws SQLException {
        currentUserId = rs.getInt("id");
        String name = rs.getString("name") != null ? rs.getString("name") : "";
        String email = rs.getString("email") != null ? rs.getString("email") : "";
        String role = rs.getString("role") != null ? rs.getString("role") : "User";
        isAdmin = rs.getInt("is_admin") == 1;
        nameLabel.setText(name);
        emailLabel.setText(email);
        roleDisplayLabel.setText("Role: " + (isAdmin ? "Admin" : role));
        roleLabel.setText("Role: " + (isAdmin ? "Admin" : role));
        adminControls.setVisible(isAdmin);
        adminControls.setManaged(isAdmin);
        adminDashboardButton.setVisible(isAdmin);
        viewPane.setVisible(true);
        viewPane.setManaged(true);
        editPane.setVisible(false);
        editPane.setManaged(false);
        System.out.println("ProfileController: loadProfile - Loaded user ID " + currentUserId + ", name: " + name + ", email: " + email + ", role: " + role + ", isAdmin: " + isAdmin);
    }

    private void setGuestMode() {
        nameLabel.setText("N/A");
        emailLabel.setText("N/A");
        roleDisplayLabel.setText("Role: Guest");
        roleLabel.setText("Role: Guest");
        adminControls.setVisible(false);
        adminControls.setManaged(false);
        adminDashboardButton.setVisible(false);
        viewPane.setVisible(true);
        viewPane.setManaged(true);
        editPane.setVisible(false);
        editPane.setManaged(false);
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) menuButton.getScene().getWindow();
        if (stage.getScene() == null) {
            showAlert("Error", "Scene is not initialized");
            System.out.println("ProfileController: navigateTo - Scene is not initialized");
            return;
        }
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                URL resource = getClass().getResource(fxmlPath);
                if (resource == null) {
                    throw new IllegalStateException("FXML resource not found: " + fxmlPath);
                }
                System.out.println("ProfileController: Loading FXML from: " + resource);
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
                System.out.println("ProfileController: Navigated to " + fxmlPath);
            } catch (Exception e) {
                showAlert("Error", "Failed to navigate: " + e.getMessage());
                System.out.println("ProfileController: navigateTo Exception - " + e.getMessage());
            }
        });
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.getDialogPane().getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        alert.getDialogPane().getStyleClass().add("glass-background");
        alert.showAndWait();
    }
}