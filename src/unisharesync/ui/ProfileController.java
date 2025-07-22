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
    @FXML private Button homeButton;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button logoutButton;
    @FXML private Button adminDashboardButton;
    @FXML private TextField nameField;
    @FXML private TextField emailField;
    @FXML private Label roleDisplayLabel;
    @FXML private HBox adminControls;
    @FXML private CheckBox isAdminCheckBox;
    @FXML private ComboBox<String> roleComboBox;
    @FXML private Button saveButton;
    @FXML private AnchorPane contentArea;

    private String currentEmail;
    private boolean isAdmin = false;
    private int currentUserId = -1;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("ProfileController: Initializing...");
        roleComboBox.setItems(FXCollections.observableArrayList("student", "faculty"));
        sidebar.setStyle("-fx-translate-z: 1;"); 
        loadProfile();
        System.out.println("ProfileController: Initialized");
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email;
        System.out.println("ProfileController: Current email set to: " + currentEmail);
        loadProfile();
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
    private void goToHome(ActionEvent event) {
        navigateTo("/unisharesync/ui/homepage.fxml");
    }

    @FXML
    private void goToAnnouncements(ActionEvent event) {
        navigateTo("/unisharesync/ui/announcement.fxml");
    }

    @FXML
    private void goToResources(ActionEvent event) {
        showAlert("Information", "Resources page not implemented yet.");
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
    private void goToAdminDashboard(ActionEvent event) {
        showAlert("Information", "Admin Dashboard not implemented yet.");
    }

    @FXML
    private void saveProfile(ActionEvent event) {
        if (currentEmail == null || currentEmail.isEmpty()) {
            showAlert("Error", "Please log in to update your profile.");
            System.out.println("saveProfile: No currentEmail set");
            return;
        }

        String newName = nameField.getText().trim();
        String newEmail = emailField.getText().trim();
        String newRole = isAdmin ? roleComboBox.getValue() : null;
        boolean newIsAdmin = isAdmin ? isAdminCheckBox.isSelected() : isAdmin;

        if (newName.isEmpty() || newEmail.isEmpty()) {
            showAlert("Error", "Name and email cannot be empty.");
            System.out.println("saveProfile: Empty name or email");
            return;
        }

        if (!newEmail.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            showAlert("Error", "Invalid email format.");
            System.out.println("saveProfile: Invalid email format: " + newEmail);
            return;
        }

        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ? AND id != ?");
            stmt.setString(1, newEmail);
            stmt.setInt(2, currentUserId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                showAlert("Error", "Email is already in use by another user.");
                System.out.println("saveProfile: Email already taken: " + newEmail);
                return;
            }

            String sql = isAdmin ?
                "UPDATE users SET name = ?, email = ?, role = ?, is_admin = ? WHERE id = ?" :
                "UPDATE users SET name = ?, email = ? WHERE id = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, newName);
            stmt.setString(2, newEmail);
            if (isAdmin) {
                stmt.setString(3, newRole);
                stmt.setInt(4, newIsAdmin ? 1 : 0);
                stmt.setInt(5, currentUserId);
            } else {
                stmt.setInt(3, currentUserId);
            }
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Profile updated successfully.");
                currentEmail = newEmail;
                System.out.println("saveProfile: Updated user ID " + currentUserId + " with name: " + newName + ", email: " + newEmail);
                loadProfile();
            } else {
                showAlert("Error", "Failed to update profile.");
                System.out.println("saveProfile: No rows affected for user ID " + currentUserId);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update profile: " + e.getMessage());
            System.out.println("saveProfile: SQLException - " + e.getMessage());
        }
    }

    private void loadProfile() {
        if (currentEmail == null || currentEmail.isEmpty()) {
            roleLabel.setText("Role: Guest");
            adminControls.setVisible(false);
            adminControls.setManaged(false);
            adminDashboardButton.setVisible(false);
            nameField.setText("");
            emailField.setText("");
            roleDisplayLabel.setText("Role: Guest");
            System.out.println("loadProfile: No currentEmail, set to Guest");
            return;
        }

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT id, name, email, role, is_admin FROM users WHERE email = ?")) {
            stmt.setString(1, currentEmail);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                currentUserId = rs.getInt("id");
                String name = rs.getString("name") != null ? rs.getString("name") : "";
                String email = rs.getString("email") != null ? rs.getString("email") : "";
                String role = rs.getString("role") != null ? rs.getString("role") : "User";
                isAdmin = rs.getInt("is_admin") == 1;
                nameField.setText(name);
                emailField.setText(email);
                roleDisplayLabel.setText("Role: " + (isAdmin ? "Admin" : role));
                roleLabel.setText("Role: " + (isAdmin ? "Admin" : role));
                adminControls.setVisible(isAdmin);
                adminControls.setManaged(isAdmin);
                adminDashboardButton.setVisible(isAdmin);
                if (isAdmin) {
                    roleComboBox.setValue(role);
                    isAdminCheckBox.setSelected(isAdmin);
                }
                System.out.println("loadProfile: Loaded user ID " + currentUserId + ", name: " + name + ", email: " + email + ", role: " + role + ", isAdmin: " + isAdmin);
            } else {
                showAlert("Error", "User not found for email: " + currentEmail);
                System.out.println("loadProfile: User not found for email: " + currentEmail);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load profile: " + e.getMessage());
            System.out.println("loadProfile: SQLException - " + e.getMessage());
        }
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) menuButton.getScene().getWindow();
        if (stage.getScene() == null) {
            showAlert("Error", "Scene is not initialized");
            System.out.println("navigateTo: Scene is not initialized");
            return;
        }
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                URL resource = getClass().getResource(fxmlPath);
                if (resource == null) {
                    throw new IllegalStateException("FXML resource not found: " + fxmlPath);
                }
                System.out.println("navigateTo: Loading FXML from: " + resource);
                FXMLLoader loader = new FXMLLoader(resource);
                AnchorPane root = loader.load();
                Object controller = loader.getController();
                if (controller instanceof Initializable) {
                    if (controller instanceof HomepageController) {
                        ((HomepageController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AnnouncementController) {
                        ((AnnouncementController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ProjectController) {
                        ((ProjectController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ProfileController) {
                        ((ProfileController) controller).setCurrentEmail(currentEmail);
                    }
                }
                Scene scene = new Scene(root, 1000, 600);
                scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                stage.setScene(scene);
                stage.getScene().getRoot().setOpacity(1);
                System.out.println("navigateTo: Navigated to " + fxmlPath);
            } catch (Exception e) {
                e.printStackTrace();
                showAlert("Error", "Failed to navigate: " + e.getMessage());
                System.out.println("navigateTo: Exception - " + e.getMessage());
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
}