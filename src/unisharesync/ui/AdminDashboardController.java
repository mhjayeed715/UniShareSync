package unisharesync.ui;

import java.io.File;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ResourceBundle;
import javafx.application.Platform;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

public class AdminDashboardController implements Initializable {

    @FXML private Button menuButton;
    @FXML private VBox sidebar;
    @FXML private AnchorPane contentArea;
    @FXML private Label roleLabel;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button adminDashboardButton;
    @FXML private Button logoutButton;
    @FXML private TabPane dashboardTabs;
    @FXML private TextField searchUserField;
    @FXML private Button searchUserButton;
    @FXML private Button viewAllUsersButton;
    @FXML private TextField addUserEmailField;
    @FXML private TextField addUserNameField;
    @FXML private TextField addUserPasswordField;
    @FXML private ComboBox<String> addUserRoleCombo;
    @FXML private Button addUserButton;
    @FXML private TextField updateUserEmailField;
    @FXML private TextField updateUserNameField;
    @FXML private TextField updateUserPasswordField;
    @FXML private ComboBox<String> updateUserRoleCombo;
    @FXML private Button updateUserButton;
    @FXML private Button deleteUserButton;
    @FXML private TableView<UserTab> usersTable;
    @FXML private TableColumn<UserTab, String> userEmailCol;
    @FXML private TableColumn<UserTab, String> userNameCol;
    @FXML private TableColumn<UserTab, String> userRoleCol;
    @FXML private TableColumn<UserTab, String> userIsAdminCol;
    @FXML private TableColumn<UserTab, Void> userActionsCol;
    @FXML private TextField searchAnnouncementField;
    @FXML private Button searchAnnouncementButton;
    @FXML private ComboBox<String> filterDepartmentCombo;
    @FXML private Button filterAnnouncementsButton;
    @FXML private Button viewAllAnnouncementsButton;
    @FXML private TextField addAnnouncementTitleField;
    @FXML private ComboBox<String> addAnnouncementDepartmentCombo;
    @FXML private TextField addAnnouncementPriorityField;
    @FXML private TextArea addAnnouncementContentArea;
    @FXML private TextField addAnnouncementImagePathField;
    @FXML private Button addAnnouncementButton;
    @FXML private TextField updateAnnouncementTitleField;
    @FXML private ComboBox<String> updateAnnouncementDepartmentCombo;
    @FXML private TextField updateAnnouncementPriorityField;
    @FXML private TextArea updateAnnouncementContentArea;
    @FXML private TextField updateAnnouncementImagePathField;
    @FXML private Button updateAnnouncementButton;
    @FXML private Button deleteAnnouncementButton;
    @FXML private TableView<AnnouncementTab> announcementsTable;
    @FXML private TableColumn<AnnouncementTab, String> announcementTitleCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementDepartmentCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementPriorityCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementContentCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementTimestampCol;
    @FXML private TextField searchResourceField;
    @FXML private Button searchResourceButton;
    @FXML private ComboBox<String> filterCategoryCombo;
    @FXML private ComboBox<String> filterSubjectCombo;
    @FXML private Button filterResourcesButton;
    @FXML private Button viewAllResourcesButton;
    @FXML private TextField addResourceTitleField;
    @FXML private ComboBox<String> addResourceCategoryCombo;
    @FXML private ComboBox<String> addResourceSubjectCombo;
    @FXML private ComboBox<String> addResourceTypeCombo;
    @FXML private TextArea addResourceDescriptionArea;
    @FXML private TextField addResourceFilePathField;
    @FXML private Button uploadResourceFileButton;
    @FXML private Button addResourceButton;
    @FXML private TextField updateResourceTitleField;
    @FXML private ComboBox<String> updateResourceCategoryCombo;
    @FXML private ComboBox<String> updateResourceSubjectCombo;
    @FXML private ComboBox<String> updateResourceTypeCombo;
    @FXML private TextArea updateResourceDescriptionArea;
    @FXML private TextField updateResourceFilePathField;
    @FXML private Button uploadUpdateResourceFileButton;
    @FXML private Button updateResourceButton;
    @FXML private Button deleteResourceButton;
    @FXML private TableView<ResourceTab> resourcesTable;
    @FXML private TableColumn<ResourceTab, String> resourceTitleCol;
    @FXML private TableColumn<ResourceTab, String> resourceCategoryCol;
    @FXML private TableColumn<ResourceTab, String> resourceSubjectCol;
    @FXML private TableColumn<ResourceTab, String> resourceTypeCol;
    @FXML private TableColumn<ResourceTab, String> resourceUploaderCol;
    @FXML private TableColumn<ResourceTab, String> resourceTimestampCol;
    @FXML private TextField searchProjectField;
    @FXML private Button searchProjectButton;
    @FXML private Button viewAllProjectsButton;
    @FXML private TextField addProjectTitleField;
    @FXML private TextField addProjectGroupLimitField;
    @FXML private TextArea addProjectDescriptionArea;
    @FXML private Button addProjectButton;
    @FXML private TextField updateProjectTitleField;
    @FXML private TextField updateProjectGroupLimitField;
    @FXML private TextArea updateProjectDescriptionArea;
    @FXML private Button updateProjectButton;
    @FXML private Button deleteProjectButton;
    @FXML private TableView<ProjectTab> projectsTable;
    @FXML private TableColumn<ProjectTab, String> projectTitleCol;
    @FXML private TableColumn<ProjectTab, String> projectDescriptionCol;
    @FXML private TableColumn<ProjectTab, String> projectGroupLimitCol;
    @FXML private TableColumn<ProjectTab, String> projectGroupCountCol;
    @FXML private TableColumn<ProjectTab, String> projectCreatorCol;
    @FXML private TableColumn<ProjectTab, String> projectTimestampCol;
    @FXML private TextField searchTaskField;
    @FXML private Button searchTaskButton;
    @FXML private ComboBox<String> filterTaskStatusCombo;
    @FXML private Button filterTasksButton;
    @FXML private Button viewAllTasksButton;
    @FXML private TextField updateTaskTitleField;
    @FXML private ComboBox<String> updateTaskStatusCombo;
    @FXML private Button updateTaskStatusButton;
    @FXML private Button deleteTaskButton;
    @FXML private TableView<TaskTab> tasksTable;
    @FXML private TableColumn<TaskTab, String> taskTitleCol;
    @FXML private TableColumn<TaskTab, String> taskDescriptionCol;
    @FXML private TableColumn<TaskTab, String> taskGroupCol;
    @FXML private TableColumn<TaskTab, String> taskAssignedToCol;
    @FXML private TableColumn<TaskTab, String> taskStatusCol;
    @FXML private TableColumn<TaskTab, String> taskCreatorCol;
    @FXML private TableColumn<TaskTab, String> taskTimestampCol;

    private String currentEmail;
    private boolean isAdmin = false;
    private int currentUserId = -1;
    
    private UserTab selectedUser = null;
    private AnnouncementTab selectedAnnouncement = null;
    private ResourceTab selectedResource = null;
    private ProjectTab selectedProject = null;
    private TaskTab selectedTask = null;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("AdminDashboardController initializing...");
        setupTableColumns();
        setupTableRowSelections();
        loadComboBoxData();
        if (currentEmail != null) {
            loadUserRole();
            refreshAllTables();
        }
        System.out.println("AdminDashboardController initialized");
    }

    private void setupTableColumns() {
        userEmailCol.setCellValueFactory(new PropertyValueFactory<>("email"));
        userNameCol.setCellValueFactory(new PropertyValueFactory<>("name"));
        userRoleCol.setCellValueFactory(new PropertyValueFactory<>("role"));
        userIsAdminCol.setCellValueFactory(new PropertyValueFactory<>("isAdminText"));

        announcementTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        announcementDepartmentCol.setCellValueFactory(new PropertyValueFactory<>("department"));
        announcementPriorityCol.setCellValueFactory(new PropertyValueFactory<>("priority"));
        announcementContentCol.setCellValueFactory(new PropertyValueFactory<>("contentSnippet"));
        announcementTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));

        resourceTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        resourceCategoryCol.setCellValueFactory(new PropertyValueFactory<>("category"));
        resourceSubjectCol.setCellValueFactory(new PropertyValueFactory<>("subject"));
        resourceTypeCol.setCellValueFactory(new PropertyValueFactory<>("resourceType"));
        resourceUploaderCol.setCellValueFactory(new PropertyValueFactory<>("uploaderName"));
        resourceTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));

        projectTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        projectDescriptionCol.setCellValueFactory(new PropertyValueFactory<>("descriptionSnippet"));
        projectGroupLimitCol.setCellValueFactory(new PropertyValueFactory<>("groupLimit"));
        projectGroupCountCol.setCellValueFactory(new PropertyValueFactory<>("groupCount"));
        projectCreatorCol.setCellValueFactory(new PropertyValueFactory<>("creatorName"));
        projectTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));

        taskTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        taskDescriptionCol.setCellValueFactory(new PropertyValueFactory<>("descriptionSnippet"));
        taskGroupCol.setCellValueFactory(new PropertyValueFactory<>("groupName"));
        taskAssignedToCol.setCellValueFactory(new PropertyValueFactory<>("assignedTo"));
        taskStatusCol.setCellValueFactory(new PropertyValueFactory<>("status"));
        taskCreatorCol.setCellValueFactory(new PropertyValueFactory<>("creatorName"));
        taskTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
    }

    private void setupTableRowSelections() {
        usersTable.setRowFactory(tv -> {
            TableRow<UserTab> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (!row.isEmpty()) {
                    UserTab clickedUser = row.getItem();
                    selectUserForEdit(clickedUser);
                    usersTable.getSelectionModel().select(clickedUser);
                }
            });
            return row;
        });

        announcementsTable.setRowFactory(tv -> {
            TableRow<AnnouncementTab> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (!row.isEmpty()) {
                    AnnouncementTab clickedAnnouncement = row.getItem();
                    selectAnnouncementForEdit(clickedAnnouncement);
                    announcementsTable.getSelectionModel().select(clickedAnnouncement);
                }
            });
            return row;
        });

        resourcesTable.setRowFactory(tv -> {
            TableRow<ResourceTab> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (!row.isEmpty()) {
                    ResourceTab clickedResource = row.getItem();
                    selectResourceForEdit(clickedResource);
                    resourcesTable.getSelectionModel().select(clickedResource);
                }
            });
            return row;
        });

        projectsTable.setRowFactory(tv -> {
            TableRow<ProjectTab> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (!row.isEmpty()) {
                    ProjectTab clickedProject = row.getItem();
                    selectProjectForEdit(clickedProject);
                    projectsTable.getSelectionModel().select(clickedProject);
                }
            });
            return row;
        });

        tasksTable.setRowFactory(tv -> {
            TableRow<TaskTab> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (!row.isEmpty()) {
                    TaskTab clickedTask = row.getItem();
                    selectTaskForEdit(clickedTask);
                    tasksTable.getSelectionModel().select(clickedTask);
                }
            });
            return row;
        });
    }

    private void selectUserForEdit(UserTab user) {
        selectedUser = user;
        updateUserEmailField.setText(user.getEmail());
        updateUserNameField.setText(user.getName());
        updateUserRoleCombo.setValue(user.getRole());
        showAlert("Selection", "User '" + user.getEmail() + "' selected for editing.");
    }

    private void selectAnnouncementForEdit(AnnouncementTab announcement) {
        selectedAnnouncement = announcement;
        updateAnnouncementTitleField.setText(announcement.getTitle());
        updateAnnouncementDepartmentCombo.setValue(announcement.getDepartment());
        updateAnnouncementPriorityField.setText(announcement.getPriority());
        updateAnnouncementContentArea.setText(announcement.getContent());
        updateAnnouncementImagePathField.setText(announcement.getImagePath() != null ? announcement.getImagePath() : "");
        showAlert("Selection", "Announcement '" + announcement.getTitle() + "' selected for editing.");
    }

    private void selectResourceForEdit(ResourceTab resource) {
        selectedResource = resource;
        updateResourceTitleField.setText(resource.getTitle());
        updateResourceCategoryCombo.setValue(resource.getCategory());
        updateResourceSubjectCombo.setValue(resource.getSubject());
        updateResourceTypeCombo.setValue(resource.getResourceType());
        updateResourceDescriptionArea.setText(resource.getDescription());
        updateResourceFilePathField.setText(resource.getFilePath());
        showAlert("Selection", "Resource '" + resource.getTitle() + "' selected for editing.");
    }

    private void selectProjectForEdit(ProjectTab project) {
        selectedProject = project;
        updateProjectTitleField.setText(project.getTitle());
        updateProjectGroupLimitField.setText(project.getGroupLimit());
        updateProjectDescriptionArea.setText(project.getDescription());
        showAlert("Selection", "Project '" + project.getTitle() + "' selected for editing.");
    }

    private void selectTaskForEdit(TaskTab task) {
        selectedTask = task;
        updateTaskTitleField.setText(task.getTitle());
        updateTaskStatusCombo.setValue(task.getStatus().equals("completed") ? "Complete" : "Pending");
        showAlert("Selection", "Task '" + task.getTitle() + "' selected for editing.");
    }

    private void loadComboBoxData() {
        ObservableList<String> roles = FXCollections.observableArrayList("student", "faculty");
        addUserRoleCombo.setItems(roles);
        addUserRoleCombo.setValue("student");
        updateUserRoleCombo.setItems(roles);

        ObservableList<String> departments = FXCollections.observableArrayList(
            "General", "CSE", "LAW", "CSIT", "GDM"
        );
        addAnnouncementDepartmentCombo.setItems(departments);
        addAnnouncementDepartmentCombo.setValue("General");
        updateAnnouncementDepartmentCombo.setItems(departments);
        
        filterDepartmentCombo.setItems(FXCollections.observableArrayList("All Departments"));
        filterDepartmentCombo.getItems().addAll(departments);
        filterDepartmentCombo.setValue("All Departments");

        ObservableList<String> categories = FXCollections.observableArrayList(
            "Books", "Notes", "Slides", "Assignments", "Past Papers", "Reference Materials", "General"
        );
        ObservableList<String> subjects = FXCollections.observableArrayList(
            "Computer Science", "Software Engineering", "Data Structures", "Algorithms", 
            "Database Systems", "Web Development", "Mobile Development", "AI/ML", 
            "Networking", "Cybersecurity", "Mathematics", "Physics", "English", "General"
        );
        ObservableList<String> types = FXCollections.observableArrayList(
            "PDF", "PowerPoint", "Word Document", "Image", "Video", "Audio", "Archive", "Other"
        );

        addResourceCategoryCombo.setItems(categories);
        addResourceCategoryCombo.setValue("General");
        updateResourceCategoryCombo.setItems(categories);
        
        addResourceSubjectCombo.setItems(subjects);
        addResourceSubjectCombo.setValue("General");
        updateResourceSubjectCombo.setItems(subjects);
        
        addResourceTypeCombo.setItems(types);
        addResourceTypeCombo.setValue("PDF");
        updateResourceTypeCombo.setItems(types);

        filterCategoryCombo.setItems(FXCollections.observableArrayList("All Categories"));
        filterCategoryCombo.getItems().addAll(categories);
        filterCategoryCombo.setValue("All Categories");
        
        filterSubjectCombo.setItems(FXCollections.observableArrayList("All Subjects"));
        filterSubjectCombo.getItems().addAll(subjects);
        filterSubjectCombo.setValue("All Subjects");

        ObservableList<String> taskStatuses = FXCollections.observableArrayList("Pending", "Complete");
        updateTaskStatusCombo.setItems(taskStatuses);
        
        filterTaskStatusCombo.setItems(FXCollections.observableArrayList("All Statuses"));
        filterTaskStatusCombo.getItems().addAll(taskStatuses);
        filterTaskStatusCombo.setValue("All Statuses");
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email;
        if (currentEmail != null) {
            System.out.println("Setting current email: " + currentEmail);
            loadUserRole();
            refreshAllTables();
        }
    }

    private void loadUserRole() {
        if (currentEmail == null) return;
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT id, role, is_admin FROM users WHERE email = ?")) {
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    currentUserId = rs.getInt("id");
                    String role = rs.getString("role");
                    isAdmin = rs.getBoolean("is_admin");
                    String roleText = isAdmin ? "Admin" : role;
                    roleLabel.setText("Role: " + roleText);
                    adminDashboardButton.setVisible(isAdmin);
                    System.out.println("User role loaded: " + roleText);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load user role: " + e.getMessage());
        }
    }

    private void refreshAllTables() {
        viewAllUsers();
        viewAllAnnouncements();
        viewAllResources();
        viewAllProjects();
        viewAllTasks();
    }

    @FXML
    private void searchUsers() {
        String searchTerm = searchUserField.getText().trim();
        loadUsers("SELECT id, email, name, role, is_admin FROM users WHERE email LIKE ? OR name LIKE ? ORDER BY email", 
                 "%" + searchTerm + "%", "%" + searchTerm + "%");
    }

    @FXML
    private void viewAllUsers() {
        searchUserField.clear();
        loadUsers("SELECT id, email, name, role, is_admin FROM users ORDER BY email");
    }

    private void loadUsers(String sql, String... params) {
        ObservableList<UserTab> users = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            for (int i = 0; i < params.length; i++) {
                stmt.setString(i + 1, params[i]);
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    users.add(new UserTab(
                        rs.getInt("id"),
                        rs.getString("email"),
                        rs.getString("name"),
                        rs.getString("role") != null ? rs.getString("role") : "student",
                        rs.getBoolean("is_admin")
                    ));
                }
            }
            usersTable.setItems(users);
            System.out.println("Loaded " + users.size() + " users");
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load users: " + e.getMessage());
        }
    }

    @FXML
    private void addUser() {
        String email = addUserEmailField.getText().trim();
        String name = addUserNameField.getText().trim();
        String password = addUserPasswordField.getText().trim();
        String role = addUserRoleCombo.getValue();
        
        if (email.isEmpty() || name.isEmpty() || password.isEmpty() || role == null) {
            showAlert("Error", "All fields are required.");
            return;
        }
        
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO users (email, name, password, role, is_admin) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            stmt.setString(2, name);
            stmt.setString(3, DBUtil.hashPassword(password));
            stmt.setString(4, role);
            stmt.setBoolean(5, false);
            stmt.executeUpdate();
            showAlert("Success", "User added successfully!");
            clearUserFields();
            viewAllUsers();
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to add user: " + e.getMessage());
        }
    }

    @FXML
    private void updateUser() {
        if (selectedUser == null) {
            showAlert("Error", "Please select a user to update by clicking on a row.");
            return;
        }
        
        String name = updateUserNameField.getText().trim();
        String password = updateUserPasswordField.getText().trim();
        String role = updateUserRoleCombo.getValue();
        
        try (Connection conn = DBUtil.getConnection()) {
            StringBuilder sql = new StringBuilder("UPDATE users SET ");
            boolean hasUpdate = false;
            
            if (!name.isEmpty()) {
                sql.append("name = ?, ");
                hasUpdate = true;
            }
            if (!password.isEmpty()) {
                sql.append("password = ?, ");
                hasUpdate = true;
            }
            if (role != null && !role.isEmpty()) {
                sql.append("role = ?, ");
                hasUpdate = true;
            }
            
            if (!hasUpdate) {
                showAlert("Error", "No fields to update.");
                return;
            }
            
            sql.setLength(sql.length() - 2);
            sql.append(" WHERE id = ?");
            
            PreparedStatement stmt = conn.prepareStatement(sql.toString());
            int paramIndex = 1;
            
            if (!name.isEmpty()) {
                stmt.setString(paramIndex++, name);
            }
            if (!password.isEmpty()) {
                stmt.setString(paramIndex++, DBUtil.hashPassword(password));
            }
            if (role != null && !role.isEmpty()) {
                stmt.setString(paramIndex++, role);
            }
            stmt.setInt(paramIndex, selectedUser.getId());
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "User updated successfully!");
                clearUserFields();
                selectedUser = null;
                viewAllUsers();
            } else {
                showAlert("Error", "Failed to update user.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update user: " + e.getMessage());
        }
    }

    @FXML
    private void deleteUser() {
        if (selectedUser == null) {
            showAlert("Error", "Please select a user to delete by clicking on a row.");
            return;
        }
        
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirm Delete");
        confirmAlert.setHeaderText(null);
        confirmAlert.setContentText("Are you sure you want to delete user: " + selectedUser.getEmail() + "?");
        
        if (confirmAlert.showAndWait().get() == ButtonType.OK) {
            try (Connection conn = DBUtil.getConnection()) {
                String sql = "DELETE FROM users WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, selectedUser.getId());
                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    showAlert("Success", "User deleted successfully!");
                    clearUserFields();
                    selectedUser = null;
                    viewAllUsers();
                } else {
                    showAlert("Error", "Failed to delete user.");
                }
            } catch (SQLException e) {
                e.printStackTrace();
                showAlert("Error", "Failed to delete user: " + e.getMessage());
            }
        }
    }

    @FXML
    private void searchAnnouncements() {
        String searchTerm = searchAnnouncementField.getText().trim();
        loadAnnouncements("SELECT id, title, content, department, created_at, priority, image_path FROM announcements WHERE title LIKE ? ORDER BY created_at DESC", 
                         "%" + searchTerm + "%");
    }

    @FXML
    private void filterAnnouncements() {
        String department = filterDepartmentCombo.getValue();
        if (department == null || department.equals("All Departments")) {
            viewAllAnnouncements();
            return;
        }
        loadAnnouncements("SELECT id, title, content, department, created_at, priority, image_path FROM announcements WHERE department = ? ORDER BY created_at DESC", 
                         department);
    }

    @FXML
    private void viewAllAnnouncements() {
        searchAnnouncementField.clear();
        filterDepartmentCombo.setValue("All Departments");
        loadAnnouncements("SELECT id, title, content, department, created_at, priority, image_path FROM announcements ORDER BY created_at DESC");
    }

    private void loadAnnouncements(String sql, String... params) {
        ObservableList<AnnouncementTab> announcements = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            for (int i = 0; i < params.length; i++) {
                stmt.setString(i + 1, params[i]);
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String content = rs.getString("content");
                    String snippet = content != null && content.length() > 100 ? content.substring(0, 100) + "..." : content;
                    announcements.add(new AnnouncementTab(
                        rs.getInt("id"),
                        rs.getString("title"),
                        content,
                        snippet,
                        rs.getString("department") != null ? rs.getString("department") : "General",
                        rs.getString("created_at") != null ? rs.getString("created_at") : "N/A",
                        rs.getString("priority") != null ? rs.getString("priority") : "1",
                        rs.getString("image_path")
                    ));
                }
            }
            announcementsTable.setItems(announcements);
            System.out.println("Loaded " + announcements.size() + " announcements");
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load announcements: " + e.getMessage());
        }
    }

    @FXML
    private void addAnnouncement() {
        String title = addAnnouncementTitleField.getText().trim();
        String content = addAnnouncementContentArea.getText().trim();
        String department = addAnnouncementDepartmentCombo.getValue();
        String priority = addAnnouncementPriorityField.getText().trim();
        String imagePath = addAnnouncementImagePathField.getText().trim();
        
        if (title.isEmpty() || content.isEmpty()) {
            showAlert("Error", "Title and content are required.");
            return;
        }
        
        if (department == null) department = "General";
        if (priority.isEmpty()) priority = "1";
        
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO announcements (title, content, department, priority, image_path, user_id) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, content);
            stmt.setString(3, department);
            stmt.setString(4, priority);
            stmt.setString(5, imagePath.isEmpty() ? null : imagePath);
            stmt.setInt(6, currentUserId);
            stmt.executeUpdate();
            showAlert("Success", "Announcement added successfully!");
            clearAnnouncementFields();
            viewAllAnnouncements();
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to add announcement: " + e.getMessage());
        }
    }

    @FXML
    private void updateAnnouncement() {
        if (selectedAnnouncement == null) {
            showAlert("Error", "Please select an announcement to update by clicking on a row.");
            return;
        }
        
        String content = updateAnnouncementContentArea.getText().trim();
        String department = updateAnnouncementDepartmentCombo.getValue();
        String priority = updateAnnouncementPriorityField.getText().trim();
        String imagePath = updateAnnouncementImagePathField.getText().trim();
        
        try (Connection conn = DBUtil.getConnection()) {
            StringBuilder sql = new StringBuilder("UPDATE announcements SET ");
            boolean hasUpdate = false;
            
            if (!content.isEmpty()) {
                sql.append("content = ?, ");
                hasUpdate = true;
            }
            if (department != null && !department.isEmpty()) {
                sql.append("department = ?, ");
                hasUpdate = true;
            }
            if (!priority.isEmpty()) {
                sql.append("priority = ?, ");
                hasUpdate = true;
            }
            if (!imagePath.isEmpty()) {
                sql.append("image_path = ?, ");
                hasUpdate = true;
            }
            
            if (!hasUpdate) {
                showAlert("Error", "No fields to update.");
                return;
            }
            
            sql.setLength(sql.length() - 2);
            sql.append(" WHERE id = ?");
            
            PreparedStatement stmt = conn.prepareStatement(sql.toString());
            int paramIndex = 1;
            
            if (!content.isEmpty()) {
                stmt.setString(paramIndex++, content);
            }
            if (department != null && !department.isEmpty()) {
                stmt.setString(paramIndex++, department);
            }
            if (!priority.isEmpty()) {
                stmt.setString(paramIndex++, priority);
            }
            if (!imagePath.isEmpty()) {
                stmt.setString(paramIndex++, imagePath);
            }
            stmt.setInt(paramIndex, selectedAnnouncement.getId());
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Announcement updated successfully!");
                clearAnnouncementFields();
                selectedAnnouncement = null;
                viewAllAnnouncements();
            } else {
                showAlert("Error", "Failed to update announcement.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update announcement: " + e.getMessage());
        }
    }

    @FXML
    private void deleteAnnouncement() {
        if (selectedAnnouncement == null) {
            showAlert("Error", "Please select an announcement to delete by clicking on a row.");
            return;
        }
        
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirm Delete");
        confirmAlert.setHeaderText(null);
        confirmAlert.setContentText("Are you sure you want to delete announcement: " + selectedAnnouncement.getTitle() + "?");
        
        if (confirmAlert.showAndWait().get() == ButtonType.OK) {
            try (Connection conn = DBUtil.getConnection()) {
                String sql = "DELETE FROM announcements WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, selectedAnnouncement.getId());
                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    showAlert("Success", "Announcement deleted successfully!");
                    clearAnnouncementFields();
                    selectedAnnouncement = null;
                    viewAllAnnouncements();
                } else {
                    showAlert("Error", "Failed to delete announcement.");
                }
            } catch (SQLException e) {
                e.printStackTrace();
                showAlert("Error", "Failed to delete announcement: " + e.getMessage());
            }
        }
    }

    @FXML
    private void searchResources() {
        String searchTerm = searchResourceField.getText().trim();
        loadResources("SELECT r.*, u.name as uploader_name FROM resources r LEFT JOIN users u ON r.user_id = u.id WHERE r.title LIKE ? ORDER BY r.created_at DESC", 
                     "%" + searchTerm + "%");
    }

    @FXML
    private void filterResources() {
        String category = filterCategoryCombo.getValue();
        String subject = filterSubjectCombo.getValue();
        
        StringBuilder sql = new StringBuilder("SELECT r.*, u.name as uploader_name FROM resources r LEFT JOIN users u ON r.user_id = u.id WHERE 1=1");
        
        if (category != null && !category.equals("All Categories")) {
            sql.append(" AND r.category = '").append(category).append("'");
        }
        if (subject != null && !subject.equals("All Subjects")) {
            sql.append(" AND r.subject = '").append(subject).append("'");
        }
        
        sql.append(" ORDER BY r.created_at DESC");
        loadResources(sql.toString());
    }

    @FXML
    private void viewAllResources() {
        searchResourceField.clear();
        filterCategoryCombo.setValue("All Categories");
        filterSubjectCombo.setValue("All Subjects");
        loadResources("SELECT r.*, u.name as uploader_name FROM resources r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC");
    }

    private void loadResources(String sql, String... params) {
        ObservableList<ResourceTab> resources = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            for (int i = 0; i < params.length; i++) {
                stmt.setString(i + 1, params[i]);
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    resources.add(new ResourceTab(
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getString("category") != null ? rs.getString("category") : "General",
                        rs.getString("subject") != null ? rs.getString("subject") : "General",
                        rs.getString("resource_type") != null ? rs.getString("resource_type") : "Document",
                        rs.getString("uploader_name") != null ? rs.getString("uploader_name") : "Unknown",
                        rs.getString("created_at") != null ? rs.getString("created_at") : "N/A",
                        rs.getString("file_path") != null ? rs.getString("file_path") : "",
                        rs.getString("description") != null ? rs.getString("description") : "",
                        rs.getInt("user_id")
                    ));
                }
            }
            resourcesTable.setItems(resources);
            System.out.println("Loaded " + resources.size() + " resources");
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load resources: " + e.getMessage());
        }
    }

    @FXML
    private void uploadResourceFile() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select Resource File");
        fileChooser.getExtensionFilters().addAll(
            new FileChooser.ExtensionFilter("All Files", "*.*"),
            new FileChooser.ExtensionFilter("PDF Files", "*.pdf"),
            new FileChooser.ExtensionFilter("PowerPoint Files", "*.ppt", "*.pptx"),
            new FileChooser.ExtensionFilter("Word Documents", "*.doc", "*.docx"),
            new FileChooser.ExtensionFilter("Images", "*.png", "*.jpg", "*.jpeg", "*.gif")
        );
        
        File file = fileChooser.showOpenDialog(menuButton.getScene().getWindow());
        if (file != null) {
            try {
                File uploadsDir = new File("src/main/resources/uploads");
                if (!uploadsDir.exists()) {
                    uploadsDir.mkdirs();
                }
                
                String destPath = "src/main/resources/uploads/" + file.getName();
                Files.copy(file.toPath(), new File(destPath).toPath(), StandardCopyOption.REPLACE_EXISTING);
                addResourceFilePathField.setText(destPath);
                
                String fileName = file.getName().toLowerCase();
                if (fileName.endsWith(".pdf")) {
                    addResourceTypeCombo.setValue("PDF");
                } else if (fileName.endsWith(".ppt") || fileName.endsWith(".pptx")) {
                    addResourceTypeCombo.setValue("PowerPoint");
                } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
                    addResourceTypeCombo.setValue("Word Document");
                } else if (fileName.matches(".*\\.(png|jpg|jpeg|gif)$")) {
                    addResourceTypeCombo.setValue("Image");
                }
                
                showAlert("Success", "File uploaded successfully!");
            } catch (Exception e) {
                showAlert("Error", "Failed to upload file: " + e.getMessage());
            }
        }
    }

    @FXML
    private void uploadUpdateResourceFile() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select New Resource File");
        fileChooser.getExtensionFilters().addAll(
            new FileChooser.ExtensionFilter("All Files", "*.*"),
            new FileChooser.ExtensionFilter("PDF Files", "*.pdf"),
            new FileChooser.ExtensionFilter("PowerPoint Files", "*.ppt", "*.pptx"),
            new FileChooser.ExtensionFilter("Word Documents", "*.doc", "*.docx"),
            new FileChooser.ExtensionFilter("Images", "*.png", "*.jpg", "*.jpeg", "*.gif")
        );
        
        File file = fileChooser.showOpenDialog(menuButton.getScene().getWindow());
        if (file != null) {
            try {
                File uploadsDir = new File("src/main/resources/uploads");
                if (!uploadsDir.exists()) {
                    uploadsDir.mkdirs();
                }
                
                String destPath = "src/main/resources/uploads/" + file.getName();
                Files.copy(file.toPath(), new File(destPath).toPath(), StandardCopyOption.REPLACE_EXISTING);
                updateResourceFilePathField.setText(destPath);
                showAlert("Success", "File uploaded successfully!");
            } catch (Exception e) {
                showAlert("Error", "Failed to upload file: " + e.getMessage());
            }
        }
    }

    @FXML
    private void addResource() {
        String title = addResourceTitleField.getText().trim();
        String category = addResourceCategoryCombo.getValue();
        String subject = addResourceSubjectCombo.getValue();
        String resourceType = addResourceTypeCombo.getValue();
        String description = addResourceDescriptionArea.getText().trim();
        String filePath = addResourceFilePathField.getText().trim();
        
        if (title.isEmpty()) {
            showAlert("Error", "Title is required.");
            return;
        }
        
        if (category == null) category = "General";
        if (subject == null) subject = "General";
        if (resourceType == null) resourceType = "Document";
        
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO resources (title, category, subject, resource_type, description, file_path, user_id, uploader_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, category);
            stmt.setString(3, subject);
            stmt.setString(4, resourceType);
            stmt.setString(5, description.isEmpty() ? null : description);
            stmt.setString(6, filePath.isEmpty() ? null : filePath);
            stmt.setInt(7, currentUserId);
            stmt.setString(8, getCurrentUserName());
            
            stmt.executeUpdate();
            showAlert("Success", "Resource added successfully!");
            clearResourceFields();
            viewAllResources();
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to add resource: " + e.getMessage());
        }
    }

    @FXML
    private void updateResource() {
        if (selectedResource == null) {
            showAlert("Error", "Please select a resource to update by clicking on a row.");
            return;
        }
        
        String title = updateResourceTitleField.getText().trim();
        String category = updateResourceCategoryCombo.getValue();
        String subject = updateResourceSubjectCombo.getValue();
        String resourceType = updateResourceTypeCombo.getValue();
        String description = updateResourceDescriptionArea.getText().trim();
        String filePath = updateResourceFilePathField.getText().trim();
        
        try (Connection conn = DBUtil.getConnection()) {
            StringBuilder sql = new StringBuilder("UPDATE resources SET ");
            boolean hasUpdate = false;
            
            if (!title.isEmpty()) {
                sql.append("title = ?, ");
                hasUpdate = true;
            }
            if (category != null && !category.isEmpty()) {
                sql.append("category = ?, ");
                hasUpdate = true;
            }
            if (subject != null && !subject.isEmpty()) {
                sql.append("subject = ?, ");
                hasUpdate = true;
            }
            if (resourceType != null && !resourceType.isEmpty()) {
                sql.append("resource_type = ?, ");
                hasUpdate = true;
            }
            if (!description.isEmpty()) {
                sql.append("description = ?, ");
                hasUpdate = true;
            }
            if (!filePath.isEmpty()) {
                sql.append("file_path = ?, ");
                hasUpdate = true;
            }
            
            if (!hasUpdate) {
                showAlert("Error", "No fields to update.");
                return;
            }
            
            sql.setLength(sql.length() - 2);
            sql.append(" WHERE id = ?");
            
            PreparedStatement stmt = conn.prepareStatement(sql.toString());
            int paramIndex = 1;
            
            if (!title.isEmpty()) {
                stmt.setString(paramIndex++, title);
            }
            if (category != null && !category.isEmpty()) {
                stmt.setString(paramIndex++, category);
            }
            if (subject != null && !subject.isEmpty()) {
                stmt.setString(paramIndex++, subject);
            }
            if (resourceType != null && !resourceType.isEmpty()) {
                stmt.setString(paramIndex++, resourceType);
            }
            if (!description.isEmpty()) {
                stmt.setString(paramIndex++, description);
            }
            if (!filePath.isEmpty()) {
                stmt.setString(paramIndex++, filePath);
            }
            stmt.setInt(paramIndex, selectedResource.getId());
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Resource updated successfully!");
                clearResourceFields();
                selectedResource = null;
                viewAllResources();
            } else {
                showAlert("Error", "Failed to update resource.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update resource: " + e.getMessage());
        }
    }

    @FXML
    private void deleteResource() {
        if (selectedResource == null) {
            showAlert("Error", "Please select a resource to delete by clicking on a row.");
            return;
        }
        
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirm Delete");
        confirmAlert.setHeaderText(null);
        confirmAlert.setContentText("Are you sure you want to delete resource: " + selectedResource.getTitle() + "?");
        
        if (confirmAlert.showAndWait().get() == ButtonType.OK) {
            try (Connection conn = DBUtil.getConnection()) {
                String sql = "DELETE FROM resources WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, selectedResource.getId());
                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    showAlert("Success", "Resource deleted successfully!");
                    clearResourceFields();
                    selectedResource = null;
                    viewAllResources();
                } else {
                    showAlert("Error", "Failed to delete resource.");
                }
            } catch (SQLException e) {
                e.printStackTrace();
                showAlert("Error", "Failed to delete resource: " + e.getMessage());
            }
        }
    }

    @FXML
    private void searchProjects() {
        String searchTerm = searchProjectField.getText().trim();
        loadProjects("SELECT p.*, u.name as creator_name, (SELECT COUNT(*) FROM project_groups pg WHERE pg.project_id = p.id) AS group_count FROM projects p LEFT JOIN users u ON p.creator_id = u.id WHERE p.title LIKE ? ORDER BY p.created_at DESC", 
                    "%" + searchTerm + "%");
    }

    @FXML
    private void viewAllProjects() {
        searchProjectField.clear();
        loadProjects("SELECT p.*, u.name as creator_name, (SELECT COUNT(*) FROM project_groups pg WHERE pg.project_id = p.id) AS group_count FROM projects p LEFT JOIN users u ON p.creator_id = u.id ORDER BY p.created_at DESC");
    }

    private void loadProjects(String sql, String... params) {
        ObservableList<ProjectTab> projects = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            for (int i = 0; i < params.length; i++) {
                stmt.setString(i + 1, params[i]);
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String description = rs.getString("description");
                    String snippet = description != null && description.length() > 100 ? description.substring(0, 100) + "..." : description;
                    projects.add(new ProjectTab(
                        rs.getInt("id"),
                        rs.getString("title"),
                        description != null ? description : "",
                        snippet != null ? snippet : "",
                        String.valueOf(rs.getInt("group_limit")),
                        String.valueOf(rs.getInt("group_count")),
                        rs.getString("creator_name") != null ? rs.getString("creator_name") : "Unknown",
                        rs.getString("created_at") != null ? rs.getString("created_at") : "N/A"
                    ));
                }
            }
            projectsTable.setItems(projects);
            System.out.println("Loaded " + projects.size() + " projects");
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load projects: " + e.getMessage());
        }
    }

    @FXML
    private void addProject() {
        String title = addProjectTitleField.getText().trim();
        String description = addProjectDescriptionArea.getText().trim();
        String groupLimitText = addProjectGroupLimitField.getText().trim();
        
        if (title.isEmpty()) {
            showAlert("Error", "Title is required.");
            return;
        }
        
        int groupLimit = 3; 
        if (!groupLimitText.isEmpty()) {
            try {
                groupLimit = Integer.parseInt(groupLimitText);
                if (groupLimit < 2 || groupLimit > 5) {
                    showAlert("Error", "Group limit must be between 2 and 5.");
                    return;
                }
            } catch (NumberFormatException e) {
                showAlert("Error", "Invalid group limit. Enter a number between 2 and 5.");
                return;
            }
        }
        
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO projects (title, description, group_limit, creator_id, user_id) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, description.isEmpty() ? null : description);
            stmt.setInt(3, groupLimit);
            stmt.setInt(4, currentUserId);
            stmt.setInt(5, currentUserId);
            stmt.executeUpdate();
            showAlert("Success", "Project added successfully!");
            clearProjectFields();
            viewAllProjects();
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to add project: " + e.getMessage());
        }
    }

    @FXML
    private void updateProject() {
        if (selectedProject == null) {
            showAlert("Error", "Please select a project to update by clicking on a row.");
            return;
        }
        
        String title = updateProjectTitleField.getText().trim();
        String description = updateProjectDescriptionArea.getText().trim();
        String groupLimitText = updateProjectGroupLimitField.getText().trim();
        
        try (Connection conn = DBUtil.getConnection()) {
            StringBuilder sql = new StringBuilder("UPDATE projects SET ");
            boolean hasUpdate = false;
            
            if (!title.isEmpty()) {
                sql.append("title = ?, ");
                hasUpdate = true;
            }
            if (!description.isEmpty()) {
                sql.append("description = ?, ");
                hasUpdate = true;
            }
            if (!groupLimitText.isEmpty()) {
                try {
                    int groupLimit = Integer.parseInt(groupLimitText);
                    if (groupLimit < 2 || groupLimit > 5) {
                        showAlert("Error", "Group limit must be between 2 and 5.");
                        return;
                    }
                    sql.append("group_limit = ?, ");
                    hasUpdate = true;
                } catch (NumberFormatException e) {
                    showAlert("Error", "Invalid group limit. Enter a number between 2 and 5.");
                    return;
                }
            }
            
            if (!hasUpdate) {
                showAlert("Error", "No fields to update.");
                return;
            }
            
            sql.setLength(sql.length() - 2);
            sql.append(" WHERE id = ?");
            
            PreparedStatement stmt = conn.prepareStatement(sql.toString());
            int paramIndex = 1;
            
            if (!title.isEmpty()) {
                stmt.setString(paramIndex++, title);
            }
            if (!description.isEmpty()) {
                stmt.setString(paramIndex++, description);
            }
            if (!groupLimitText.isEmpty()) {
                stmt.setInt(paramIndex++, Integer.parseInt(groupLimitText));
            }
            stmt.setInt(paramIndex, selectedProject.getId());
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Project updated successfully!");
                clearProjectFields();
                selectedProject = null;
                viewAllProjects();
            } else {
                showAlert("Error", "Failed to update project.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update project: " + e.getMessage());
        }
    }

    @FXML
    private void deleteProject() {
        if (selectedProject == null) {
            showAlert("Error", "Please select a project to delete by clicking on a row.");
            return;
        }
        
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirm Delete");
        confirmAlert.setHeaderText(null);
        confirmAlert.setContentText("Are you sure you want to delete project: " + selectedProject.getTitle() + "?\nThis will also delete all associated groups and tasks.");
        
        if (confirmAlert.showAndWait().get() == ButtonType.OK) {
            try (Connection conn = DBUtil.getConnection()) {
                String sql = "DELETE FROM projects WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, selectedProject.getId());
                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    showAlert("Success", "Project deleted successfully!");
                    clearProjectFields();
                    selectedProject = null;
                    viewAllProjects();
                } else {
                    showAlert("Error", "Failed to delete project.");
                }
            } catch (SQLException e) {
                e.printStackTrace();
                showAlert("Error", "Failed to delete project: " + e.getMessage());
            }
        }
    }

    @FXML
    private void searchTasks() {
        String searchTerm = searchTaskField.getText().trim();
        loadTasks("SELECT t.*, pg.name as group_name, u1.name as creator_name, u2.name as assigned_to_name FROM tasks t " +
                 "LEFT JOIN project_groups pg ON t.group_id = pg.group_id " +
                 "LEFT JOIN users u1 ON t.creator_id = u1.id " +
                 "LEFT JOIN users u2 ON t.assigned_to_id = u2.id " +
                 "WHERE t.title LIKE ? ORDER BY t.created_at DESC", 
                 "%" + searchTerm + "%");
    }

    @FXML
    private void filterTasks() {
        String status = filterTaskStatusCombo.getValue();
        if (status == null || status.equals("All Statuses")) {
            viewAllTasks();
            return;
        }
        
        String dbStatus = status.equals("Complete") ? "completed" : "pending";
        loadTasks("SELECT t.*, pg.name as group_name, u1.name as creator_name, u2.name as assigned_to_name FROM tasks t " +
                 "LEFT JOIN project_groups pg ON t.group_id = pg.group_id " +
                 "LEFT JOIN users u1 ON t.creator_id = u1.id " +
                 "LEFT JOIN users u2 ON t.assigned_to_id = u2.id " +
                 "WHERE t.status = ? ORDER BY t.created_at DESC", 
                 dbStatus);
    }

    @FXML
    private void viewAllTasks() {
        searchTaskField.clear();
        filterTaskStatusCombo.setValue("All Statuses");
        loadTasks("SELECT t.*, pg.name as group_name, u1.name as creator_name, u2.name as assigned_to_name FROM tasks t " +
                 "LEFT JOIN project_groups pg ON t.group_id = pg.group_id " +
                 "LEFT JOIN users u1 ON t.creator_id = u1.id " +
                 "LEFT JOIN users u2 ON t.assigned_to_id = u2.id " +
                 "ORDER BY t.created_at DESC");
    }

    private void loadTasks(String sql, String... params) {
        ObservableList<TaskTab> tasks = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            for (int i = 0; i < params.length; i++) {
                stmt.setString(i + 1, params[i]);
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String description = rs.getString("description");
                    String snippet = description != null && description.length() > 100 ? description.substring(0, 100) + "..." : description;
                    String assignedTo = rs.getString("assigned_to_name");
                    if (assignedTo == null) {
                        assignedTo = "Entire Group";
                    }
                    tasks.add(new TaskTab(
                        rs.getInt("id"),
                        rs.getString("title"),
                        description != null ? description : "",
                        snippet != null ? snippet : "",
                        rs.getString("group_name") != null ? rs.getString("group_name") : "Unknown",
                        assignedTo,
                        rs.getString("status"),
                        rs.getString("creator_name") != null ? rs.getString("creator_name") : "Unknown",
                        rs.getString("created_at") != null ? rs.getString("created_at") : "N/A"
                    ));
                }
            }
            tasksTable.setItems(tasks);
            System.out.println("Loaded " + tasks.size() + " tasks");
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load tasks: " + e.getMessage());
        }
    }

    @FXML
    private void updateTaskStatus() {
        if (selectedTask == null) {
            showAlert("Error", "Please select a task to update by clicking on a row.");
            return;
        }
        
        String newStatus = updateTaskStatusCombo.getValue();
        if (newStatus == null) {
            showAlert("Error", "Please select a status.");
            return;
        }
        
        String dbStatus = newStatus.equals("Complete") ? "completed" : "pending";
        
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "UPDATE tasks SET status = ? WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, dbStatus);
            stmt.setInt(2, selectedTask.getId());
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Task status updated successfully!");
                clearTaskFields();
                selectedTask = null;
                viewAllTasks();
            } else {
                showAlert("Error", "Failed to update task status.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update task status: " + e.getMessage());
        }
    }

    @FXML
    private void deleteTask() {
        if (selectedTask == null) {
            showAlert("Error", "Please select a task to delete by clicking on a row.");
            return;
        }
        
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirm Delete");
        confirmAlert.setHeaderText(null);
        confirmAlert.setContentText("Are you sure you want to delete task: " + selectedTask.getTitle() + "?");
        
        if (confirmAlert.showAndWait().get() == ButtonType.OK) {
            try (Connection conn = DBUtil.getConnection()) {
                String sql = "DELETE FROM tasks WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, selectedTask.getId());
                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    showAlert("Success", "Task deleted successfully!");
                    clearTaskFields();
                    selectedTask = null;
                    viewAllTasks();
                } else {
                    showAlert("Error", "Failed to delete task.");
                }
            } catch (SQLException e) {
                e.printStackTrace();
                showAlert("Error", "Failed to delete task: " + e.getMessage());
            }
        }
    }

    @FXML
    private void toggleMenu(ActionEvent event) {
        boolean isVisible = !sidebar.isVisible();
        sidebar.setVisible(isVisible);
        
        if (isVisible) {
            sidebar.toFront();
            AnchorPane.setLeftAnchor(contentArea, 200.0);
        } else {
            AnchorPane.setLeftAnchor(contentArea, 0.0);
        }
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
    private void goToAdminDashboard(ActionEvent event) {
        navigateTo("/unisharesync/ui/admin_dashboard.fxml");
    }

    @FXML
    private void handleLogout(ActionEvent event) {
        navigateTo("/unisharesync/ui/login.fxml");
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) menuButton.getScene().getWindow();
        if (stage.getScene() == null) {
            showAlert("Error", "Scene is not initialized");
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
                    if (controller instanceof AnnouncementController) {
                        ((AnnouncementController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ResourceController) {
                        ((ResourceController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ProjectController) {
                        ((ProjectController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ProfileController) {
                        ((ProfileController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AdminDashboardController) {
                        ((AdminDashboardController) controller).setCurrentEmail(currentEmail);
                    }
                }
                Scene scene = new Scene(root, 1000, 600);
                scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                stage.setScene(scene);
                stage.getScene().getRoot().setOpacity(1);
            } catch (Exception e) {
                showAlert("Error", "Failed to navigate: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }

    private String getCurrentUserName() throws SQLException {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT name FROM users WHERE id = ?")) {
            stmt.setInt(1, currentUserId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("name");
                }
            }
        }
        return "Unknown";
    }

    private void clearUserFields() {
        addUserEmailField.clear();
        addUserNameField.clear();
        addUserPasswordField.clear();
        addUserRoleCombo.setValue("student");
        updateUserEmailField.clear();
        updateUserNameField.clear();
        updateUserPasswordField.clear();
        updateUserRoleCombo.setValue(null);
    }

    private void clearAnnouncementFields() {
        addAnnouncementTitleField.clear();
        addAnnouncementContentArea.clear();
        addAnnouncementDepartmentCombo.setValue("General");
        addAnnouncementPriorityField.clear();
        addAnnouncementImagePathField.clear();
        updateAnnouncementTitleField.clear();
        updateAnnouncementContentArea.clear();
        updateAnnouncementDepartmentCombo.setValue(null);
        updateAnnouncementPriorityField.clear();
        updateAnnouncementImagePathField.clear();
    }

    private void clearResourceFields() {
        addResourceTitleField.clear();
        addResourceCategoryCombo.setValue("General");
        addResourceSubjectCombo.setValue("General");
        addResourceTypeCombo.setValue("PDF");
        addResourceDescriptionArea.clear();
        addResourceFilePathField.clear();
        updateResourceTitleField.clear();
        updateResourceCategoryCombo.setValue(null);
        updateResourceSubjectCombo.setValue(null);
        updateResourceTypeCombo.setValue(null);
        updateResourceDescriptionArea.clear();
        updateResourceFilePathField.clear();
    }

    private void clearProjectFields() {
        addProjectTitleField.clear();
        addProjectGroupLimitField.clear();
        addProjectDescriptionArea.clear();
        updateProjectTitleField.clear();
        updateProjectGroupLimitField.clear();
        updateProjectDescriptionArea.clear();
    }

    private void clearTaskFields() {
        updateTaskTitleField.clear();
        updateTaskStatusCombo.setValue(null);
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

    public static class UserTab {
        private final int id;
        private final StringProperty email = new SimpleStringProperty();
        private final StringProperty name = new SimpleStringProperty();
        private final StringProperty role = new SimpleStringProperty();
        private final StringProperty isAdminText = new SimpleStringProperty();
        private final boolean isAdmin;

        public UserTab(int id, String email, String name, String role, boolean isAdmin) {
            this.id = id;
            this.isAdmin = isAdmin;
            this.email.set(email);
            this.name.set(name);
            this.role.set(role);
            this.isAdminText.set(isAdmin ? "Yes" : "No");
        }

        public int getId() { return id; }
        public String getEmail() { return email.get(); }
        public String getName() { return name.get(); }
        public String getRole() { return role.get(); }
        public String getIsAdminText() { return isAdminText.get(); }
        public boolean isAdmin() { return isAdmin; }

        public StringProperty emailProperty() { return email; }
        public StringProperty nameProperty() { return name; }
        public StringProperty roleProperty() { return role; }
        public StringProperty isAdminTextProperty() { return isAdminText; }
    }

    public static class AnnouncementTab {
        private final int id;
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty content = new SimpleStringProperty();
        private final StringProperty contentSnippet = new SimpleStringProperty();
        private final StringProperty department = new SimpleStringProperty();
        private final StringProperty createdAt = new SimpleStringProperty();
        private final StringProperty priority = new SimpleStringProperty();
        private final StringProperty imagePath = new SimpleStringProperty();

        public AnnouncementTab(int id, String title, String content, String contentSnippet, String department, String createdAt, String priority, String imagePath) {
            this.id = id;
            this.title.set(title);
            this.content.set(content);
            this.contentSnippet.set(contentSnippet);
            this.department.set(department);
            this.createdAt.set(createdAt);
            this.priority.set(priority);
            this.imagePath.set(imagePath);
        }

        public int getId() { return id; }
        public String getTitle() { return title.get(); }
        public String getContent() { return content.get(); }
        public String getContentSnippet() { return contentSnippet.get(); }
        public String getDepartment() { return department.get(); }
        public String getCreatedAt() { return createdAt.get(); }
        public String getPriority() { return priority.get(); }
        public String getImagePath() { return imagePath.get(); }

        public StringProperty titleProperty() { return title; }
        public StringProperty contentProperty() { return content; }
        public StringProperty contentSnippetProperty() { return contentSnippet; }
        public StringProperty departmentProperty() { return department; }
        public StringProperty createdAtProperty() { return createdAt; }
        public StringProperty priorityProperty() { return priority; }
        public StringProperty imagePathProperty() { return imagePath; }
    }

    public static class ResourceTab {
        private final int id;
        private final int userId;
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty category = new SimpleStringProperty();
        private final StringProperty subject = new SimpleStringProperty();
        private final StringProperty resourceType = new SimpleStringProperty();
        private final StringProperty uploaderName = new SimpleStringProperty();
        private final StringProperty createdAt = new SimpleStringProperty();
        private final StringProperty filePath = new SimpleStringProperty();
        private final StringProperty description = new SimpleStringProperty();

        public ResourceTab(int id, String title, String category, String subject, String resourceType, 
                          String uploaderName, String createdAt, String filePath, String description, int userId) {
            this.id = id;
            this.userId = userId;
            this.title.set(title);
            this.category.set(category);
            this.subject.set(subject);
            this.resourceType.set(resourceType);
            this.uploaderName.set(uploaderName);
            this.createdAt.set(createdAt);
            this.filePath.set(filePath);
            this.description.set(description);
        }

        public int getId() { return id; }
        public int getUserId() { return userId; }
        public String getTitle() { return title.get(); }
        public String getCategory() { return category.get(); }
        public String getSubject() { return subject.get(); }
        public String getResourceType() { return resourceType.get(); }
        public String getUploaderName() { return uploaderName.get(); }
        public String getCreatedAt() { return createdAt.get(); }
        public String getFilePath() { return filePath.get(); }
        public String getDescription() { return description.get(); }

        public StringProperty titleProperty() { return title; }
        public StringProperty categoryProperty() { return category; }
        public StringProperty subjectProperty() { return subject; }
        public StringProperty resourceTypeProperty() { return resourceType; }
        public StringProperty uploaderNameProperty() { return uploaderName; }
        public StringProperty createdAtProperty() { return createdAt; }
        public StringProperty filePathProperty() { return filePath; }
        public StringProperty descriptionProperty() { return description; }
    }

    public static class ProjectTab {
        private final int id;
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty description = new SimpleStringProperty();
        private final StringProperty descriptionSnippet = new SimpleStringProperty();
        private final StringProperty groupLimit = new SimpleStringProperty();
        private final StringProperty groupCount = new SimpleStringProperty();
        private final StringProperty creatorName = new SimpleStringProperty();
        private final StringProperty createdAt = new SimpleStringProperty();

        public ProjectTab(int id, String title, String description, String descriptionSnippet, String groupLimit, 
                         String groupCount, String creatorName, String createdAt) {
            this.id = id;
            this.title.set(title);
            this.description.set(description);
            this.descriptionSnippet.set(descriptionSnippet);
            this.groupLimit.set(groupLimit);
            this.groupCount.set(groupCount);
            this.creatorName.set(creatorName);
            this.createdAt.set(createdAt);
        }

        public int getId() { return id; }
        public String getTitle() { return title.get(); }
        public String getDescription() { return description.get(); }
        public String getDescriptionSnippet() { return descriptionSnippet.get(); }
        public String getGroupLimit() { return groupLimit.get(); }
        public String getGroupCount() { return groupCount.get(); }
        public String getCreatorName() { return creatorName.get(); }
        public String getCreatedAt() { return createdAt.get(); }

        public StringProperty titleProperty() { return title; }
        public StringProperty descriptionProperty() { return description; }
        public StringProperty descriptionSnippetProperty() { return descriptionSnippet; }
        public StringProperty groupLimitProperty() { return groupLimit; }
        public StringProperty groupCountProperty() { return groupCount; }
        public StringProperty creatorNameProperty() { return creatorName; }
        public StringProperty createdAtProperty() { return createdAt; }
    }

    public static class TaskTab {
        private final int id;
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty description = new SimpleStringProperty();
        private final StringProperty descriptionSnippet = new SimpleStringProperty();
        private final StringProperty groupName = new SimpleStringProperty();
        private final StringProperty assignedTo = new SimpleStringProperty();
        private final StringProperty status = new SimpleStringProperty();
        private final StringProperty creatorName = new SimpleStringProperty();
        private final StringProperty createdAt = new SimpleStringProperty();

        public TaskTab(int id, String title, String description, String descriptionSnippet, String groupName, 
                      String assignedTo, String status, String creatorName, String createdAt) {
            this.id = id;
            this.title.set(title);
            this.description.set(description);
            this.descriptionSnippet.set(descriptionSnippet);
            this.groupName.set(groupName);
            this.assignedTo.set(assignedTo);
            this.status.set(status);
            this.creatorName.set(creatorName);
            this.createdAt.set(createdAt);
        }

        public int getId() { return id; }
        public String getTitle() { return title.get(); }
        public String getDescription() { return description.get(); }
        public String getDescriptionSnippet() { return descriptionSnippet.get(); }
        public String getGroupName() { return groupName.get(); }
        public String getAssignedTo() { return assignedTo.get(); }
        public String getStatus() { return status.get(); }
        public String getCreatorName() { return creatorName.get(); }
        public String getCreatedAt() { return createdAt.get(); }

        public StringProperty titleProperty() { return title; }
        public StringProperty descriptionProperty() { return description; }
        public StringProperty descriptionSnippetProperty() { return descriptionSnippet; }
        public StringProperty groupNameProperty() { return groupName; }
        public StringProperty assignedToProperty() { return assignedTo; }
        public StringProperty statusProperty() { return status; }
        public StringProperty creatorNameProperty() { return creatorName; }
        public StringProperty createdAtProperty() { return createdAt; }
    }
}