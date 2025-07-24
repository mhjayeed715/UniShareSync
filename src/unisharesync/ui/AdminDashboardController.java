package unisharesync.ui;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ResourceBundle;
import javafx.application.Platform;
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
import javafx.stage.FileChooser;
import javafx.stage.Stage;

public class AdminDashboardController implements Initializable {

    @FXML private Button menuButton;
    @FXML private Button logoutButton;
    @FXML private Label roleLabel;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button adminDashboardButton;
    @FXML private AnchorPane contentArea;
    @FXML private TabPane dashboardTabs;
    @FXML private TextField searchUserField;
    @FXML private Button searchUserButton;
    @FXML private TextField addUserEmailField;
    @FXML private TextField addUserNameField;
    @FXML private TextField addUserPasswordField;
    @FXML private ChoiceBox<String> addUserRoleChoice; 
    @FXML private Button addUserButton;
    @FXML private TextField updateUserEmailField;
    @FXML private TextField updateUserNameField;
    @FXML private TextField updateUserPasswordField;
    @FXML private Button updateUserButton;
    @FXML private Button deleteUserButton;
    @FXML private TableView<User> usersTable;
    @FXML private TableColumn<User, String> userEmailCol;
    @FXML private TableColumn<User, String> userNameCol;
    @FXML private TableColumn<User, String> userPasswordCol;
    @FXML private TableColumn<User, String> userRoleCol; 
    @FXML private Button viewUsersButton;
    @FXML private TextField searchAnnouncementField;
    @FXML private Button searchAnnouncementButton;
    @FXML private TextField addAnnouncementTitleField;
    @FXML private TextField addAnnouncementContentField;
    @FXML private Button addAnnouncementButton;
    @FXML private TextField updateAnnouncementTitleField;
    @FXML private TextField updateAnnouncementContentField;
    @FXML private Button updateAnnouncementButton;
    @FXML private Button deleteAnnouncementButton;
    @FXML private TableView<Announcement> announcementsTable;
    @FXML private TableColumn<Announcement, String> announcementTitleCol;
    @FXML private TableColumn<Announcement, String> announcementContentCol;
    @FXML private Button viewAnnouncementsButton;
    @FXML private TextField searchResourceField;
    @FXML private Button searchResourceButton;
    @FXML private TextField addResourceTitleField;
    @FXML private TextField addResourceFilePathField;
    @FXML private Button uploadResourceButton;
    @FXML private Button addResourceButton;
    @FXML private TextField updateResourceTitleField;
    @FXML private TextField updateResourceFilePathField;
    @FXML private Button uploadUpdateResourceButton;
    @FXML private Button updateResourceButton;
    @FXML private Button deleteResourceButton;
    @FXML private TableView<Resource> resourcesTable;
    @FXML private TableColumn<Resource, String> resourceTitleCol;
    @FXML private TableColumn<Resource, String> resourceFilePathCol;
    @FXML private Button viewResourcesButton;
    @FXML private TextField searchTaskField;
    @FXML private Button searchTaskButton;
    @FXML private TextField addTaskTitleField;
    @FXML private TextField addTaskDescriptionField;
    @FXML private TextField addTaskStatusField;
    @FXML private Button addTaskButton;
    @FXML private TextField updateTaskTitleField;
    @FXML private TextField updateTaskDescriptionField;
    @FXML private TextField updateTaskStatusField;
    @FXML private Button updateTaskButton;
    @FXML private Button deleteTaskButton;
    @FXML private TableView<Task> tasksTable;
    @FXML private TableColumn<Task, String> taskTitleCol;
    @FXML private TableColumn<Task, String> taskDescriptionCol;
    @FXML private TableColumn<Task, String> taskStatusCol;
    @FXML private Button viewTasksButton;
    @FXML private TextField searchProjectField;
    @FXML private Button searchProjectButton;
    @FXML private TextField addProjectTitleField;
    @FXML private Button addProjectButton;
    @FXML private TextField updateProjectTitleField;
    @FXML private Button updateProjectButton;
    @FXML private Button deleteProjectButton;
    @FXML private TableView<Project> projectsTable;
    @FXML private TableColumn<Project, String> projectTitleCol;
    @FXML private Button viewProjectsButton;

    private String currentEmail;
    private boolean isAdmin = false;
    private static final String UPLOAD_DIR = "Uploads";

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("AdminDashboardController: Initializing...");
        createUploadDirectory();
        setupTables();
        addUserRoleChoice.setItems(FXCollections.observableArrayList("student", "faculty"));
        addUserRoleChoice.setValue("student"); 
        if (currentEmail != null) {
            loadUserRole();
            refreshAllTables();
        }
        System.out.println("AdminDashboardController: Initialized, currentEmail=" + currentEmail);
    }

    private void createUploadDirectory() {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdir();
        }
    }

    private void setupTables() {
        userEmailCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getEmail() : ""));
        userNameCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getName() : ""));
        userPasswordCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getPassword() : ""));
        userRoleCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getRole() : ""));

        announcementTitleCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getTitle() : ""));
        announcementContentCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getContent() : ""));

        resourceTitleCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getTitle() : ""));
        resourceFilePathCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getFilePath() : ""));

        taskTitleCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getTitle() : ""));
        taskDescriptionCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getDescription() : ""));
        taskStatusCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getStatus() : ""));

        projectTitleCol.setCellValueFactory(cellData -> 
            new javafx.beans.property.SimpleStringProperty(cellData.getValue() != null ? cellData.getValue().getTitle() : ""));
    }

    @FXML
    private void toggleMenu(ActionEvent event) {
        System.out.println("AdminDashboardController: Toggle menu clicked");
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
            System.out.println("AdminDashboardController: Sidebar visibility set to: " + sidebar.isVisible());
        } else {
            System.out.println("AdminDashboardController: Sidebar not found");
        }
    }

    @FXML
    private void goToAnnouncements(ActionEvent event) {
        System.out.println("AdminDashboardController: Navigate to announcement.fxml");
        navigateTo("/unisharesync/ui/announcement.fxml");
    }

    @FXML
    private void goToResources(ActionEvent event) {
        System.out.println("AdminDashboardController: Navigate to resource.fxml");
        navigateTo("/unisharesync/ui/resource.fxml");
    }

    @FXML
    private void goToProjects(ActionEvent event) {
        System.out.println("AdminDashboardController: Navigate to project.fxml");
        navigateTo("/unisharesync/ui/project.fxml");
    }

    @FXML
    private void goToProfile(ActionEvent event) {
        System.out.println("AdminDashboardController: Navigate to profile.fxml, currentEmail=" + currentEmail);
        navigateTo("/unisharesync/ui/profile.fxml");
    }

    @FXML
    private void goToAdminDashboard(ActionEvent event) {
        System.out.println("AdminDashboardController: Already on admin_dashboard.fxml");
        navigateTo("/unisharesync/ui/admin_dashboard.fxml");
    }

    @FXML
    private void handleLogout(ActionEvent event) {
        System.out.println("AdminDashboardController: Logout clicked");
        currentEmail = null;
        navigateTo("/unisharesync/ui/login.fxml");
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email != null ? email.trim().toLowerCase() : null;
        System.out.println("AdminDashboardController: Current email set to: " + currentEmail);
        if (currentEmail != null) {
            loadUserRole();
            refreshAllTables();
        }
    }

    private void loadUserRole() {
        if (currentEmail == null) {
            roleLabel.setText("Role: Not Logged In");
            System.out.println("AdminDashboardController: loadUserRole - No currentEmail, set to Not Logged In");
            return;
        }
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            System.out.println("AdminDashboardController: loadUserRole - Database connection established");
            String sql = "SELECT role, is_admin FROM users WHERE email = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, currentEmail);
            rs = stmt.executeQuery();
            if (rs.next()) {
                String role = rs.getString("role");
                isAdmin = rs.getBoolean("is_admin");
                roleLabel.setText("Role: " + (isAdmin ? "Admin" : role));
                System.out.println("AdminDashboardController: loadUserRole - Loaded role: " + role + ", isAdmin: " + isAdmin);
            } else {
                roleLabel.setText("Role: Unknown");
                System.out.println("AdminDashboardController: loadUserRole - No user found for email: " + currentEmail);
            }
        } catch (SQLException e) {
            roleLabel.setText("Role: Error");
            showAlert(Alert.AlertType.ERROR, "Role load failed: " + e.getMessage());
            System.out.println("AdminDashboardController: loadUserRole SQLException - " + e.getMessage());
        } finally {
            if (conn != null) try { conn.close(); } catch (SQLException e) {}
            if (rs != null) try { rs.close(); } catch (SQLException e) {}
            if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        }
    }

    private void refreshAllTables() {
        viewUsers(null);
        viewAnnouncements(null);
        viewResources(null);
        viewTasks(null);
        viewProjects(null);
    }

    @FXML
    private void searchUsers(ActionEvent event) {
        String searchTerm = searchUserField.getText();
        ObservableList<User> users = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT email, name, password, role FROM users WHERE email LIKE ? OR name LIKE ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, "%" + (searchTerm.isEmpty() ? "" : searchTerm) + "%");
            stmt.setString(2, "%" + (searchTerm.isEmpty() ? "" : searchTerm) + "%");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                users.add(new User(rs.getString("email"), rs.getString("name"), rs.getString("password"), rs.getString("role")));
            }
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Search failed: " + e.getMessage());
        }
        usersTable.setItems(users);
    }

    @FXML
    private void addUser(ActionEvent event) {
        String email = addUserEmailField.getText();
        String name = addUserNameField.getText();
        String password = addUserPasswordField.getText();
        String role = addUserRoleChoice.getValue();
        if (email.isEmpty() || name.isEmpty() || password.isEmpty() || role == null) {
            showAlert(Alert.AlertType.WARNING, "All fields are required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO users (email, name, password, role, is_admin) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            stmt.setString(2, name);
            stmt.setString(3, DBUtil.hashPassword(password));
            stmt.setString(4, role);
            stmt.setBoolean(5, role.equals("faculty")); 
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "User added successfully!");
            clearUserFields();
            searchUsers(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Add failed: " + e.getMessage());
        }
    }
    
    @FXML
    private void updateUser(ActionEvent event) {
        String email = updateUserEmailField.getText();
        String name = updateUserNameField.getText();
        String password = updateUserPasswordField.getText();
        if (email.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Email is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE users SET name = ?, password = ? WHERE email = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, name.isEmpty() ? getUserField(email, "name") : name);
            stmt.setString(2, password.isEmpty() ? getUserField(email, "password") : DBUtil.hashPassword(password));
            stmt.setString(3, email);
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "User updated successfully!");
            clearUserFields();
            searchUsers(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Update failed: " + e.getMessage());
        }
    }

    @FXML
    private void deleteUser(ActionEvent event) {
        User selectedUser = usersTable.getSelectionModel().getSelectedItem();
        if (selectedUser == null) {
            showAlert(Alert.AlertType.WARNING, "Please select a user to delete.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "DELETE FROM users WHERE email = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, selectedUser.getEmail());
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "User deleted successfully!");
            searchUsers(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Delete failed: " + e.getMessage());
        }
    }
    
    @FXML
    private void viewUsers(ActionEvent event) {
        searchUsers(event); 
    }

    @FXML
    private void searchAnnouncements(ActionEvent event) {
        String searchTerm = searchAnnouncementField.getText();
        ObservableList<Announcement> announcements = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT title, content FROM announcements WHERE title LIKE ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, "%" + (searchTerm.isEmpty() ? "" : searchTerm) + "%");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                announcements.add(new Announcement(rs.getString("title"), rs.getString("content")));
            }
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Search failed: " + e.getMessage());
        }
        announcementsTable.setItems(announcements);
    }

    @FXML
    private void addAnnouncement(ActionEvent event) {
        String title = addAnnouncementTitleField.getText();
        String content = addAnnouncementContentField.getText();
        if (title.isEmpty() || content.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Title and content are required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO announcements (title, content) VALUES (?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, content);
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Announcement added successfully!");
            clearAnnouncementFields();
            searchAnnouncements(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Add failed: " + e.getMessage());
        }
    }

    @FXML
    private void updateAnnouncement(ActionEvent event) {
        String title = updateAnnouncementTitleField.getText();
        String content = updateAnnouncementContentField.getText();
        if (title.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE announcements SET content = ? WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, content.isEmpty() ? getAnnouncementField(title, "content") : content);
            stmt.setString(2, title);
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Announcement updated successfully!");
            clearAnnouncementFields();
            searchAnnouncements(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Update failed: " + e.getMessage());
        }
    }

    @FXML
    private void deleteAnnouncement(ActionEvent event) {
        Announcement selectedAnnouncement = announcementsTable.getSelectionModel().getSelectedItem();
        if (selectedAnnouncement == null) {
            showAlert(Alert.AlertType.WARNING, "Please select an announcement to delete.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "DELETE FROM announcements WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, selectedAnnouncement.getTitle());
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Announcement deleted successfully!");
            searchAnnouncements(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Delete failed: " + e.getMessage());
        }
    }
    
    @FXML
    private void viewAnnouncements(ActionEvent event) {
        searchAnnouncements(event); 
    }

    @FXML
    private void searchResources(ActionEvent event) {
        String searchTerm = searchResourceField.getText();
        ObservableList<Resource> resources = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT title, file_path FROM resources WHERE title LIKE ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, "%" + (searchTerm.isEmpty() ? "" : searchTerm) + "%");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                resources.add(new Resource(rs.getString("title"), rs.getString("file_path")));
            }
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Search failed: " + e.getMessage());
        }
        resourcesTable.setItems(resources);
    }

    @FXML
    private void uploadResource(ActionEvent event) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select Resource File");
        fileChooser.getExtensionFilters().addAll(
            new FileChooser.ExtensionFilter("All Files", "*.*"),
            new FileChooser.ExtensionFilter("PDF", "*.pdf"),
            new FileChooser.ExtensionFilter("DOC/DOCX", "*.doc", "*.docx"),
            new FileChooser.ExtensionFilter("Images", "*.png", "*.jpg", "*.jpeg", "*.gif")
        );
        File selectedFile = fileChooser.showOpenDialog(uploadResourceButton.getScene().getWindow());
        if (selectedFile != null) {
            try {
                String fileName = System.currentTimeMillis() + "_" + selectedFile.getName();
                Path targetPath = Path.of(UPLOAD_DIR, fileName);
                Files.copy(selectedFile.toPath(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                addResourceFilePathField.setText(targetPath.toString());
            } catch (IOException e) {
                showAlert(Alert.AlertType.ERROR, "File upload failed: " + e.getMessage());
            }
        }
    }

    @FXML
    private void addResource(ActionEvent event) {
        String title = addResourceTitleField.getText();
        String filePath = addResourceFilePathField.getText();
        if (title.isEmpty() || filePath.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Title and file path are required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO resources (title, file_path) VALUES (?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, filePath);
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Resource added successfully!");
            clearResourceFields();
            searchResources(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Add failed: " + e.getMessage());
        }
    }

    @FXML
    private void uploadUpdateResource(ActionEvent event) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select Resource File");
        fileChooser.getExtensionFilters().addAll(
            new FileChooser.ExtensionFilter("All Files", "*.*"),
            new FileChooser.ExtensionFilter("PDF", "*.pdf"),
            new FileChooser.ExtensionFilter("DOC/DOCX", "*.doc", "*.docx"),
            new FileChooser.ExtensionFilter("Images", "*.png", "*.jpg", "*.jpeg", "*.gif")
        );
        File selectedFile = fileChooser.showOpenDialog(uploadUpdateResourceButton.getScene().getWindow());
        if (selectedFile != null) {
            try {
                String fileName = System.currentTimeMillis() + "_" + selectedFile.getName();
                Path targetPath = Path.of(UPLOAD_DIR, fileName);
                Files.copy(selectedFile.toPath(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                updateResourceFilePathField.setText(targetPath.toString());
            } catch (IOException e) {
                showAlert(Alert.AlertType.ERROR, "File upload failed: " + e.getMessage());
            }
        }
    }

    @FXML
    private void updateResource(ActionEvent event) {
        String title = updateResourceTitleField.getText();
        String filePath = updateResourceFilePathField.getText();
        if (title.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE resources SET file_path = ? WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, filePath.isEmpty() ? getResourceField(title, "file_path") : filePath);
            stmt.setString(2, title);
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Resource updated successfully!");
            clearResourceFields();
            searchResources(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Update failed: " + e.getMessage());
        }
    }

    @FXML
    private void deleteResource(ActionEvent event) {
        Resource selectedResource = resourcesTable.getSelectionModel().getSelectedItem();
        if (selectedResource == null) {
            showAlert(Alert.AlertType.WARNING, "Please select a resource to delete.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "DELETE FROM resources WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, selectedResource.getTitle());
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Resource deleted successfully!");
            searchResources(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Delete failed: " + e.getMessage());
        }
    }
    
    @FXML
    private void viewResources(ActionEvent event) {
        searchResources(event); 
    }

    @FXML
    private void searchTasks(ActionEvent event) {
        String searchTerm = searchTaskField.getText();
        ObservableList<Task> tasks = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT title, description, status FROM tasks WHERE title LIKE ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, "%" + (searchTerm.isEmpty() ? "" : searchTerm) + "%");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                tasks.add(new Task(rs.getString("title"), rs.getString("description"), rs.getString("status")));
            }
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Search failed: " + e.getMessage());
        }
        tasksTable.setItems(tasks);
    }

    @FXML
    private void addTask(ActionEvent event) {
        String title = addTaskTitleField.getText();
        String description = addTaskDescriptionField.getText();
        String status = addTaskStatusField.getText();
        if (title.isEmpty() || description.isEmpty() || status.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "All fields are required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, description);
            stmt.setString(3, status);
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Task added successfully!");
            clearTaskFields();
            searchTasks(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Add failed: " + e.getMessage());
        }
    }

    @FXML
    private void updateTask(ActionEvent event) {
        String title = updateTaskTitleField.getText();
        String description = updateTaskDescriptionField.getText();
        String status = updateTaskStatusField.getText();
        if (title.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE tasks SET description = ?, status = ? WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, description.isEmpty() ? getTaskField(title, "description") : description);
            stmt.setString(2, status.isEmpty() ? getTaskField(title, "status") : status);
            stmt.setString(3, title);
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Task updated successfully!");
            clearTaskFields();
            searchTasks(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Update failed: " + e.getMessage());
        }
    }

    @FXML
    private void deleteTask(ActionEvent event) {
        Task selectedTask = tasksTable.getSelectionModel().getSelectedItem();
        if (selectedTask == null) {
            showAlert(Alert.AlertType.WARNING, "Please select a task to delete.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "DELETE FROM tasks WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, selectedTask.getTitle());
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Task deleted successfully!");
            searchTasks(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Delete failed: " + e.getMessage());
        }
    }
    
    @FXML
    private void viewTasks(ActionEvent event) {
        searchTasks(event); 
    }

    @FXML
    private void searchProjects(ActionEvent event) {
        String searchTerm = searchProjectField.getText();
        ObservableList<Project> projects = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT title FROM projects WHERE title LIKE ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, "%" + (searchTerm.isEmpty() ? "" : searchTerm) + "%");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                projects.add(new Project(rs.getString("title")));
            }
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Search failed: " + e.getMessage());
        }
        projectsTable.setItems(projects);
    }

    @FXML
    private void addProject(ActionEvent event) {
        String title = addProjectTitleField.getText();
        if (title.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO projects (title) VALUES (?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Project added successfully!");
            clearProjectFields();
            searchProjects(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Add failed: " + e.getMessage());
        }
    }

    @FXML
    private void updateProject(ActionEvent event) {
        String title = updateProjectTitleField.getText();
        if (title.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Title is required.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE projects SET title = ? WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title); 
            stmt.setString(2, title); 
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Project updated successfully!");
            clearProjectFields();
            searchProjects(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Update failed: " + e.getMessage());
        }
    }

    @FXML
    private void deleteProject(ActionEvent event) {
        Project selectedProject = projectsTable.getSelectionModel().getSelectedItem();
        if (selectedProject == null) {
            showAlert(Alert.AlertType.WARNING, "Please select a project to delete.");
            return;
        }
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "DELETE FROM projects WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, selectedProject.getTitle());
            stmt.executeUpdate();
            showAlert(Alert.AlertType.INFORMATION, "Project deleted successfully!");
            searchProjects(event); 
        } catch (SQLException e) {
            showAlert(Alert.AlertType.ERROR, "Delete failed: " + e.getMessage());
        }
    }
    
    @FXML
    private void viewProjects(ActionEvent event) {
        searchProjects(event); 
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) menuButton.getScene().getWindow();
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                URL resource = getClass().getResource(fxmlPath);
                if (resource == null) {
                    throw new IllegalStateException("FXML resource not found: " + fxmlPath);
                }
                System.out.println("AdminDashboardController: Loading FXML from: " + resource);
                FXMLLoader loader = new FXMLLoader(resource);
                AnchorPane root = loader.load();
                Object controller = loader.getController();
                if (controller instanceof Initializable) {
                    if (controller instanceof AnnouncementController) {
                        ((AnnouncementController) controller).setCurrentEmail(currentEmail);
                        System.out.println("AdminDashboardController: Passed currentEmail " + currentEmail + " to AnnouncementController");
                    } else if (controller instanceof DashboardController) {
                        ((DashboardController) controller).setCurrentEmail(currentEmail);
                        System.out.println("AdminDashboardController: Passed currentEmail " + currentEmail + " to DashboardController");
                    } else if (controller instanceof AdminDashboardController) {
                        ((AdminDashboardController) controller).setCurrentEmail(currentEmail);
                        System.out.println("AdminDashboardController: Passed currentEmail " + currentEmail + " to AdminDashboardController");
                    } else if (controller instanceof ProfileController) {
                        ((ProfileController) controller).setCurrentEmail(currentEmail);
                        System.out.println("AdminDashboardController: Passed currentEmail " + currentEmail + " to ProfileController");
                    } else if (controller instanceof ProjectController) {
                        ((ProjectController) controller).setCurrentEmail(currentEmail);
                        System.out.println("AdminDashboardController: Passed currentEmail " + currentEmail + " to ProjectController");
                    } else if (controller instanceof ResourceController) {
                        ((ResourceController) controller).setCurrentEmail(currentEmail);
                        System.out.println("AdminDashboardController: Passed currentEmail " + currentEmail + " to ResourceController");
                    }
                }
                Scene scene = new Scene(root, 1000, 600);
                scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                stage.setScene(scene);
                stage.getScene().getRoot().setOpacity(1);
                System.out.println("AdminDashboardController: Navigated to " + fxmlPath);
            } catch (Exception e) {
                showAlert(Alert.AlertType.ERROR, "Navigation failed: " + e.getMessage());
                System.out.println("AdminDashboardController: navigateTo Exception - " + e.getMessage());
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

    private void clearUserFields() {
        addUserEmailField.clear();
        addUserNameField.clear();
        addUserPasswordField.clear();
        addUserRoleChoice.setValue("student"); 
        updateUserEmailField.clear();
        updateUserNameField.clear();
        updateUserPasswordField.clear();
    }

    private void clearAnnouncementFields() {
        addAnnouncementTitleField.clear();
        addAnnouncementContentField.clear();
        updateAnnouncementTitleField.clear();
        updateAnnouncementContentField.clear();
    }

    private void clearResourceFields() {
        addResourceTitleField.clear();
        addResourceFilePathField.clear();
        updateResourceTitleField.clear();
        updateResourceFilePathField.clear();
    }

    private void clearTaskFields() {
        addTaskTitleField.clear();
        addTaskDescriptionField.clear();
        addTaskStatusField.clear();
        updateTaskTitleField.clear();
        updateTaskDescriptionField.clear();
        updateTaskStatusField.clear();
    }

    private void clearProjectFields() {
        addProjectTitleField.clear();
        updateProjectTitleField.clear();
    }

    private String getUserField(String email, String field) throws SQLException {
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT " + field + " FROM users WHERE email = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString(field);
            }
        }
        return "";
    }

    private String getAnnouncementField(String title, String field) throws SQLException {
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT " + field + " FROM announcements WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString(field);
            }
        }
        return "";
    }

    private String getResourceField(String title, String field) throws SQLException {
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT " + field + " FROM resources WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString(field);
            }
        }
        return "";
    }

    private String getTaskField(String title, String field) throws SQLException {
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "SELECT " + field + " FROM tasks WHERE title = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString(field);
            }
        }
        return "";
    }
}

class User {
    private String email;
    private String name;
    private String password;
    private String role;

    public User(String email, String name, String password, String role) {
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
    }

    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
}

class Announcement {
    private String title;
    private String content;

    public Announcement(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public String getTitle() { return title; }
    public String getContent() { return content; }
}

class Resource {
    private String title;
    private String filePath;

    public Resource(String title, String filePath) {
        this.title = title;
        this.filePath = filePath;
    }

    public String getTitle() { return title; }
    public String getFilePath() { return filePath; }
}

class Task {
    private String title;
    private String description;
    private String status;

    public Task(String title, String description, String status) {
        this.title = title;
        this.description = description;
        this.status = status;
    }

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
}

class Project {
    private String title;

    public Project(String title) {
        this.title = title;
    }

    public String getTitle() { return title; }
}