package unisharesync.ui;

import java.net.URL;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
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
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.geometry.Insets;
import javafx.stage.Modality;
import javafx.stage.Stage;

public class ProjectController implements Initializable {

    @FXML private Button menuButton;
    @FXML private VBox sidebar;
    @FXML private AnchorPane contentArea;
    @FXML private Label roleLabel;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button logoutButton;
    @FXML private Button adminDashboardButton;
    @FXML private Button createProjectButton;
    @FXML private Button createGroupButton;
    @FXML private Button createTaskButton;
    @FXML private Label groupsSectionTitle;
    @FXML private Label tasksSectionTitle;
    @FXML private Label joinRequestsSectionTitle;
    @FXML private TableView<ProjectTab> projectsTable;
    @FXML private TableColumn<ProjectTab, String> projectTitleCol;
    @FXML private TableColumn<ProjectTab, String> projectDescriptionCol;
    @FXML private TableColumn<ProjectTab, String> projectGroupLimitCol;
    @FXML private TableColumn<ProjectTab, String> projectGroupCountCol;
    @FXML private TableColumn<ProjectTab, String> projectCreatedAtCol;
    @FXML private TableColumn<ProjectTab, Void> createGroupCol;
    @FXML private TableColumn<ProjectTab, Void> viewGroupsCol;
    @FXML private TableView<GroupTab> groupsTable;
    @FXML private TableColumn<GroupTab, String> groupNameCol;
    @FXML private TableColumn<GroupTab, String> groupCreatorCol;
    @FXML private TableColumn<GroupTab, String> groupMemberCountCol;
    @FXML private TableColumn<GroupTab, String> groupCreatedAtCol;
    @FXML private TableColumn<GroupTab, Void> joinGroupCol;
    @FXML private TableColumn<GroupTab, Void> viewTasksCol;
    @FXML private TableView<TaskTab> tasksTable;
    @FXML private TableColumn<TaskTab, String> taskTitleCol;
    @FXML private TableColumn<TaskTab, String> taskDescriptionCol;
    @FXML private TableColumn<TaskTab, String> taskAssignedToCol;
    @FXML private TableColumn<TaskTab, String> taskStatusCol;
    @FXML private TableColumn<TaskTab, String> taskCreatedAtCol;
    @FXML private TableColumn<TaskTab, Void> taskActionsCol;
    @FXML private TableView<JoinRequestTab> joinRequestsTable;
    @FXML private TableColumn<JoinRequestTab, String> requestUserCol;
    @FXML private TableColumn<JoinRequestTab, String> requestStatusCol;
    @FXML private TableColumn<JoinRequestTab, Void> requestActionsCol;

    private String currentEmail;
    private int selectedProjectId = -1;
    private int selectedGroupId = -1;
    private boolean isAdminOrFaculty = false;
    private boolean isStudent = false;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        initializeTableColumns();
        setupCustomColumns();
        loadProjects();
        hideSecondaryTables();
        updateRoleLabel();
    }

    private void initializeTableColumns() {
        projectTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        projectDescriptionCol.setCellValueFactory(new PropertyValueFactory<>("description"));
        projectGroupLimitCol.setCellValueFactory(new PropertyValueFactory<>("groupLimit"));
        projectGroupCountCol.setCellValueFactory(new PropertyValueFactory<>("groupCount"));
        projectCreatedAtCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
        groupNameCol.setCellValueFactory(new PropertyValueFactory<>("name"));
        groupCreatorCol.setCellValueFactory(new PropertyValueFactory<>("creatorEmail"));
        groupMemberCountCol.setCellValueFactory(new PropertyValueFactory<>("memberCount"));
        groupCreatedAtCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
        taskTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        taskDescriptionCol.setCellValueFactory(new PropertyValueFactory<>("description"));
        taskAssignedToCol.setCellValueFactory(new PropertyValueFactory<>("assignedTo"));
        taskStatusCol.setCellValueFactory(new PropertyValueFactory<>("status"));
        taskCreatedAtCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
        requestUserCol.setCellValueFactory(new PropertyValueFactory<>("userEmail"));
        requestStatusCol.setCellValueFactory(new PropertyValueFactory<>("status"));
    }

    private void setupCustomColumns() {
        setupCreateGroupColumn();
        setupViewGroupsColumn();
        setupJoinGroupColumn();
        setupViewTasksColumn();
        setupTaskActionsColumn();
        setupRequestActionsColumn();
    }

    private void hideSecondaryTables() {
        groupsTable.setVisible(false);
        createGroupButton.setVisible(false);
        groupsSectionTitle.setVisible(false);
        tasksTable.setVisible(false);
        createTaskButton.setVisible(false);
        tasksSectionTitle.setVisible(false);
        joinRequestsTable.setVisible(false);
        joinRequestsSectionTitle.setVisible(false);
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email != null ? email.trim().toLowerCase() : null;
        updateRoleLabel();
    }

    @FXML
    private void toggleMenu(ActionEvent event) {
        VBox sidebarElement = sidebar;
        AnchorPane contentAreaElement = contentArea;
        
        if (sidebarElement == null || contentAreaElement == null) {
            if (menuButton != null && menuButton.getScene() != null) {
                if (sidebarElement == null) {
                    sidebarElement = (VBox) menuButton.getScene().getRoot().lookup("#sidebar");
                }
                if (contentAreaElement == null) {
                    contentAreaElement = (AnchorPane) menuButton.getScene().getRoot().lookup("#contentArea");
                }
            }
        }
        
        if (sidebarElement != null && contentAreaElement != null) {
            boolean isVisible = !sidebarElement.isVisible();
            sidebarElement.setVisible(isVisible);
            
            if (isVisible) {
                sidebarElement.toFront();
                AnchorPane.setLeftAnchor(contentAreaElement, 200.0);
            } else {
                AnchorPane.setLeftAnchor(contentAreaElement, 0.0);
            }
        }
    }

    @FXML
    private void goToAnnouncements(ActionEvent event) {
        navigateTo("/unisharesync/ui/announcement.fxml");
    }

    @FXML
    private void goToResources(ActionEvent event) {
        navigateTo("/unisharesync/ui/resources.fxml");
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
        if (isAdminOrFaculty) {
            navigateTo("/unisharesync/ui/admin_dashboard.fxml");
        } else {
            showAlert("Error", "Access denied: Admin or Faculty privileges required.");
        }
    }

    @FXML
    private void createProject(ActionEvent event) {
        if (!isAdminOrFaculty) {
            showAlert("Error", "Only admins and faculty can create projects.");
            return;
        }
        if (currentEmail == null || currentEmail.isEmpty()) {
            showAlert("Error", "Please log in to create a project.");
            return;
        }

        Stage popup = new Stage();
        popup.initModality(Modality.APPLICATION_MODAL);
        VBox popupLayout = new VBox(10);
        popupLayout.setPadding(new Insets(10));
        popupLayout.getStyleClass().add("popup-content");

        Label titleLabel = new Label("Create Project");
        titleLabel.getStyleClass().add("popup-title");
        TextField titleField = new TextField();
        titleField.setPromptText("Project Title");
        titleField.getStyleClass().add("form-input");
        TextArea descriptionArea = new TextArea();
        descriptionArea.setPromptText("Project Description");
        descriptionArea.setWrapText(true);
        descriptionArea.setPrefHeight(100);
        descriptionArea.getStyleClass().add("form-input");
        TextField groupLimitField = new TextField();
        groupLimitField.setPromptText("Group Limit (2-5)");
        groupLimitField.getStyleClass().add("form-input");
        Button saveButton = new Button("Save");
        saveButton.getStyleClass().add("card-button");
        Button cancelButton = new Button("Cancel");
        cancelButton.getStyleClass().add("card-button");

        saveButton.setOnAction(e -> {
            String title = titleField.getText().trim();
            String description = descriptionArea.getText().trim();
            String groupLimitText = groupLimitField.getText().trim();
            int groupLimit;
            try {
                groupLimit = Integer.parseInt(groupLimitText);
                if (groupLimit < 2 || groupLimit > 5) {
                    showAlert("Error", "Group limit must be between 2 and 5.");
                    return;
                }
            } catch (NumberFormatException ex) {
                showAlert("Error", "Invalid group limit. Enter a number between 2 and 5.");
                return;
            }
            if (title.isEmpty()) {
                showAlert("Error", "Project title cannot be empty.");
                return;
            }
            saveProject(title, description, groupLimit, popup);
        });
        cancelButton.setOnAction(e -> popup.close());

        popupLayout.getChildren().addAll(titleLabel, titleField, descriptionArea, groupLimitField, saveButton, cancelButton);
        Scene scene = new Scene(popupLayout, 400, 350);
        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        popup.setScene(scene);
        popup.setTitle("Create Project");
        popup.show();
    }

    private void saveProject(String title, String description, int groupLimit, Stage popup) {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?")) {
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    showAlert("Error", "User not found for email: " + currentEmail);
                    return;
                }
                int userId = rs.getInt("id");

                PreparedStatement insertStmt = conn.prepareStatement(
                    "INSERT INTO projects (title, description, creator_id, user_id, group_limit, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
                insertStmt.setString(1, title);
                insertStmt.setString(2, description.isEmpty() ? null : description);
                insertStmt.setInt(3, userId);
                insertStmt.setInt(4, userId);
                insertStmt.setInt(5, groupLimit);
                insertStmt.executeUpdate();

                showAlert("Success", "Project created successfully!");
                loadProjects();
                popup.close();
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to create project: " + e.getMessage());
        }
    }

    @FXML
    private void createGroup(ActionEvent event) {
        if (!isStudent) {
            showAlert("Error", "Only students can create groups!");
            return;
        }
        if (selectedProjectId == -1) {
            showAlert("Error", "Please select a project to create a group.");
            return;
        }
        if (currentEmail == null || currentEmail.isEmpty()) {
            showAlert("Error", "Please log in to create a group.");
            return;
        }

        Stage popup = new Stage();
        popup.initModality(Modality.APPLICATION_MODAL);
        VBox popupLayout = new VBox(10);
        popupLayout.setPadding(new Insets(10));
        popupLayout.getStyleClass().add("popup-content");

        Label titleLabel = new Label("Create Group");
        titleLabel.getStyleClass().add("popup-title");
        TextField nameField = new TextField();
        nameField.setPromptText("Group Name");
        nameField.getStyleClass().add("form-input");
        Button saveButton = new Button("Save");
        saveButton.getStyleClass().add("card-button");
        Button cancelButton = new Button("Cancel");
        cancelButton.getStyleClass().add("card-button");

        saveButton.setOnAction(e -> {
            String name = nameField.getText().trim();
            if (name.isEmpty()) {
                showAlert("Error", "Group name cannot be empty.");
                return;
            }
            saveGroup(name, popup);
        });
        cancelButton.setOnAction(e -> popup.close());

        popupLayout.getChildren().addAll(titleLabel, nameField, saveButton, cancelButton);
        Scene scene = new Scene(popupLayout, 400, 200);
        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        popup.setScene(scene);
        popup.setTitle("Create Group");
        popup.show();
    }

    private void saveGroup(String groupName, Stage popup) {
        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?");
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    showAlert("Error", "User not found for email: " + currentEmail);
                    return;
                }
                int userId = rs.getInt("id");

                stmt = conn.prepareStatement(
                    "SELECT id FROM group_memberships WHERE user_id = ? AND group_id IN (SELECT group_id FROM project_groups WHERE project_id = ?) AND status = 'accepted'");
                stmt.setInt(1, userId);
                stmt.setInt(2, selectedProjectId);
                try (ResultSet rs2 = stmt.executeQuery()) {
                    if (rs2.next()) {
                        showAlert("Error", "You are already a member of a group for this project.");
                        return;
                    }
                }

                stmt = conn.prepareStatement(
                    "INSERT INTO project_groups (project_id, name, creator_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
                    Statement.RETURN_GENERATED_KEYS);
                stmt.setInt(1, selectedProjectId);
                stmt.setString(2, groupName);
                stmt.setInt(3, userId);
                stmt.executeUpdate();

                try (ResultSet rs3 = stmt.getGeneratedKeys()) {
                    if (rs3.next()) {
                        int groupId = rs3.getInt(1);

                        stmt = conn.prepareStatement(
                            "INSERT INTO group_memberships (group_id, user_id, status, joined_at) VALUES (?, ?, 'accepted', CURRENT_TIMESTAMP)");
                        stmt.setInt(1, groupId);
                        stmt.setInt(2, userId);
                        stmt.executeUpdate();

                        showAlert("Success", "Group created successfully!");
                        loadGroups();
                        popup.close();
                    }
                }
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to create group: " + e.getMessage());
        }
    }

    @FXML
    private void createTask(ActionEvent event) {
        if (selectedGroupId == -1) {
            showAlert("Error", "Please select a group to create a task.");
            return;
        }
        if (currentEmail == null || currentEmail.isEmpty()) {
            showAlert("Error", "Please log in to create a task.");
            return;
        }

        if (isStudent) {
            try (Connection conn = DBUtil.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(
                     "SELECT id FROM group_memberships WHERE group_id = ? AND user_id = (SELECT id FROM users WHERE email = ?) AND status = 'accepted'")) {
                stmt.setInt(1, selectedGroupId);
                stmt.setString(2, currentEmail);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) {
                        showAlert("Error", "You must be a member of the group to create tasks.");
                        return;
                    }
                }
            } catch (SQLException e) {
                showAlert("Error", "Failed to verify group membership: " + e.getMessage());
                return;
            }
        }

        Stage popup = new Stage();
        popup.initModality(Modality.APPLICATION_MODAL);
        VBox popupLayout = new VBox(10);
        popupLayout.setPadding(new Insets(10));
        popupLayout.getStyleClass().add("popup-content");

        Label titleLabel = new Label("Create Task");
        titleLabel.getStyleClass().add("popup-title");
        TextField titleField = new TextField();
        titleField.setPromptText("Task Title");
        titleField.getStyleClass().add("form-input");
        TextArea descriptionArea = new TextArea();
        descriptionArea.setPromptText("Task Description");
        descriptionArea.setWrapText(true);
        descriptionArea.setPrefHeight(100);
        descriptionArea.getStyleClass().add("form-input");
        
        ComboBox<String> assignToCombo = new ComboBox<>();
        assignToCombo.setPromptText("Assign to (Optional - leave empty for entire group)");
        assignToCombo.getStyleClass().add("form-input");
        loadGroupMembersForAssignment(assignToCombo);
        
        Button saveButton = new Button("Save");
        saveButton.getStyleClass().add("card-button");
        Button cancelButton = new Button("Cancel");
        cancelButton.getStyleClass().add("card-button");

        saveButton.setOnAction(e -> {
            String title = titleField.getText().trim();
            String description = descriptionArea.getText().trim();
            String assignedTo = assignToCombo.getValue();
            if (title.isEmpty()) {
                showAlert("Error", "Task title cannot be empty.");
                return;
            }
            saveTask(title, description, assignedTo, popup);
        });
        cancelButton.setOnAction(e -> popup.close());

        popupLayout.getChildren().addAll(titleLabel, titleField, descriptionArea, assignToCombo, saveButton, cancelButton);
        Scene scene = new Scene(popupLayout, 400, 400);
        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        popup.setScene(scene);
        popup.setTitle("Create Task");
        popup.show();
    }

    private void loadGroupMembersForAssignment(ComboBox<String> assignToCombo) {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT u.email FROM users u " +
                 "JOIN group_memberships gm ON u.id = gm.user_id " +
                 "WHERE gm.group_id = ? AND gm.status = 'accepted'")) {
            stmt.setInt(1, selectedGroupId);
            try (ResultSet rs = stmt.executeQuery()) {
                ObservableList<String> members = FXCollections.observableArrayList();
                while (rs.next()) {
                    members.add(rs.getString("email"));
                }
                assignToCombo.setItems(members);
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to load group members: " + e.getMessage());
        }
    }

    private void saveTask(String title, String description, String assignedTo, Stage popup) {
        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?");
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    showAlert("Error", "User not found for email: " + currentEmail);
                    return;
                }
                int creatorId = rs.getInt("id");

                Integer assignedToId = null;
                if (assignedTo != null && !assignedTo.isEmpty()) {
                    stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?");
                    stmt.setString(1, assignedTo);
                    try (ResultSet rs2 = stmt.executeQuery()) {
                        if (rs2.next()) {
                            assignedToId = rs2.getInt("id");
                        }
                    }
                }

                stmt = conn.prepareStatement(
                    "INSERT INTO tasks (group_id, title, description, creator_id, assigned_to_id, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)");
                stmt.setInt(1, selectedGroupId);
                stmt.setString(2, title);
                stmt.setString(3, description.isEmpty() ? null : description);
                stmt.setInt(4, creatorId);
                if (assignedToId != null) {
                    stmt.setInt(5, assignedToId);
                } else {
                    stmt.setNull(5, java.sql.Types.INTEGER);
                }
                stmt.executeUpdate();
                
                showAlert("Success", "Task created successfully!");
                loadTasks();
                popup.close();
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to create task: " + e.getMessage());
        }
    }

    private void updateRoleLabel() {
        if (currentEmail == null || currentEmail.isEmpty()) {
            roleLabel.setText("Role: Guest");
            adminDashboardButton.setVisible(false);
            createProjectButton.setVisible(false);
            createGroupButton.setVisible(false);
            createTaskButton.setVisible(false);
            isAdminOrFaculty = false;
            isStudent = false;
            return;
        }
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT role, is_admin FROM users WHERE email = ?")) {
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String role = rs.getString("role");
                    boolean isAdmin = rs.getInt("is_admin") == 1;
                    isAdminOrFaculty = isAdmin || "faculty".equalsIgnoreCase(role);
                    isStudent = "student".equalsIgnoreCase(role) && !isAdmin;
                    String roleText = role != null ? role : "student";
                    roleLabel.setText("Role: " + (isAdmin ? "Admin" : roleText));
                    adminDashboardButton.setVisible(isAdmin);
                    createProjectButton.setVisible(isAdminOrFaculty);
                    createGroupButton.setVisible(isStudent && selectedProjectId != -1);
                    createTaskButton.setVisible((isAdminOrFaculty || (isStudent && selectedGroupId != -1)));
                } else {
                    roleLabel.setText("Role: student");
                    adminDashboardButton.setVisible(false);
                    createProjectButton.setVisible(false);
                    createGroupButton.setVisible(false);
                    createTaskButton.setVisible(false);
                    isAdminOrFaculty = false;
                    isStudent = true;
                }
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to load user role: " + e.getMessage());
        }
    }

    private void loadProjects() {
        ObservableList<ProjectTab> projects = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT p.id, p.title, p.description, p.group_limit, p.created_at, " +
                 "(SELECT COUNT(*) FROM project_groups pg WHERE pg.project_id = p.id) AS group_count " +
                 "FROM projects p ORDER BY p.created_at DESC")) {
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String description = rs.getString("description") != null ? rs.getString("description") : "";
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    projects.add(new ProjectTab(rs.getInt("id"), rs.getString("title"), description,
                        rs.getInt("group_limit"), rs.getInt("group_count"), createdAt));
                }
            }
            projectsTable.setItems(projects);
        } catch (SQLException e) {
            showAlert("Error", "Failed to load projects: " + e.getMessage());
        }
        hideSecondaryTables();
        selectedProjectId = -1;
        selectedGroupId = -1;
        updateRoleLabel();
    }

    private void loadGroups() {
        if (selectedProjectId == -1) {
            groupsTable.setVisible(false);
            groupsSectionTitle.setVisible(false);
            return;
        }
        ObservableList<GroupTab> groups = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT pg.group_id, pg.name, pg.created_at, u.email AS creator_email, " +
                 "(SELECT COUNT(*) FROM group_memberships gm WHERE gm.group_id = pg.group_id AND gm.status = 'accepted') AS member_count " +
                 "FROM project_groups pg JOIN users u ON pg.creator_id = u.id WHERE pg.project_id = ? ORDER BY pg.created_at DESC")) {
            stmt.setInt(1, selectedProjectId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    groups.add(new GroupTab(rs.getInt("group_id"), rs.getString("name"), rs.getString("creator_email"),
                        rs.getInt("member_count"), createdAt));
                }
            }
            groupsTable.setItems(groups);
            groupsTable.setVisible(true);
            groupsSectionTitle.setVisible(true);
            groupsSectionTitle.setText("Groups for Selected Project");
        } catch (SQLException e) {
            showAlert("Error", "Failed to load groups: " + e.getMessage());
        }
        loadJoinRequests();
    }

    private void loadTasks() {
        if (selectedGroupId == -1) {
            tasksTable.setVisible(false);
            tasksSectionTitle.setVisible(false);
            createTaskButton.setVisible(false);
            return;
        }
        ObservableList<TaskTab> tasks = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT t.id, t.title, t.description, t.status, t.created_at, " +
                 "COALESCE(u.email, 'Entire Group') AS assigned_to " +
                 "FROM tasks t " +
                 "LEFT JOIN users u ON t.assigned_to_id = u.id " +
                 "WHERE t.group_id = ? ORDER BY t.created_at DESC")) {
            stmt.setInt(1, selectedGroupId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String description = rs.getString("description") != null ? rs.getString("description") : "";
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    String assignedTo = rs.getString("assigned_to");
                    String status = rs.getString("status");
                    String displayStatus = status.equals("completed") ? "Complete" : "Pending";
                    tasks.add(new TaskTab(rs.getInt("id"), rs.getString("title"), description, 
                        assignedTo, displayStatus, createdAt));
                }
            }
            tasksTable.setItems(tasks);
            tasksTable.setVisible(true);
            tasksSectionTitle.setVisible(true);
            tasksSectionTitle.setText("Tasks for Selected Group");
            createTaskButton.setVisible(isAdminOrFaculty || isStudent);
        } catch (SQLException e) {
            showAlert("Error", "Failed to load tasks: " + e.getMessage());
        }
    }

    private void loadJoinRequests() {
        if (currentEmail == null || currentEmail.isEmpty()) {
            joinRequestsTable.setVisible(false);
            joinRequestsSectionTitle.setVisible(false);
            return;
        }

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt1 = conn.prepareStatement("SELECT id FROM users WHERE email = ?")) {

            stmt1.setString(1, currentEmail);

            try (ResultSet rs = stmt1.executeQuery()) {
                if (!rs.next()) {
                    joinRequestsTable.setVisible(false);
                    joinRequestsSectionTitle.setVisible(false);
                    return;
                }

                int userId = rs.getInt("id");

                ObservableList<JoinRequestTab> requests = FXCollections.observableArrayList();

                try (PreparedStatement stmt2 = conn.prepareStatement(
                        "SELECT gm.id, gm.group_id, u.email, gm.status " +
                        "FROM group_memberships gm " +
                        "JOIN users u ON gm.user_id = u.id " +
                        "WHERE gm.group_id IN (SELECT group_id FROM project_groups WHERE creator_id = ?) " +
                        "AND gm.status = 'pending'")) {

                    stmt2.setInt(1, userId);

                    try (ResultSet rs2 = stmt2.executeQuery()) {
                        while (rs2.next()) {
                            requests.add(new JoinRequestTab(
                                    rs2.getInt("id"),
                                    rs2.getInt("group_id"),
                                    rs2.getString("email"),
                                    rs2.getString("status")
                            ));
                        }
                    }
                }

                joinRequestsTable.setItems(requests);
                joinRequestsTable.setVisible(!requests.isEmpty());
                joinRequestsSectionTitle.setVisible(!requests.isEmpty());
            }

        } catch (SQLException e) {
            showAlert("Error", "Failed to load join requests: " + e.getMessage());
        }
    }

    private void setupCreateGroupColumn() {
        createGroupCol.setCellFactory(param -> new TableCell<>() {
            private final Button createButton = new Button("Create");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || !isStudent) {
                    setGraphic(null);
                } else {
                    ProjectTab project = getTableView().getItems().get(getIndex());
                    createButton.getStyleClass().add("card-button");
                    createButton.setOnAction(event -> {
                        selectedProjectId = project.getId();
                        createGroup(new ActionEvent());
                    });
                    setGraphic(createButton);
                }
            }
        });
    }

    private void setupViewGroupsColumn() {
        viewGroupsCol.setCellFactory(param -> new TableCell<>() {
            private final Button viewButton = new Button("View");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    ProjectTab project = getTableView().getItems().get(getIndex());
                    viewButton.getStyleClass().add("card-button");
                    viewButton.setOnAction(event -> {
                        selectedProjectId = project.getId();
                        groupsSectionTitle.setText("Groups for " + project.getTitle());
                        loadGroups();
                        createGroupButton.setVisible(isStudent);
                    });
                    setGraphic(viewButton);
                }
            }
        });
    }

    private void setupJoinGroupColumn() {
        joinGroupCol.setCellFactory(param -> new TableCell<>() {
            private final Button joinButton = new Button("Join");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || !isStudent) {
                    setGraphic(null);
                } else {
                    GroupTab group = getTableView().getItems().get(getIndex());
                    joinButton.getStyleClass().add("card-button");
                    joinButton.setOnAction(event -> joinGroup(group));
                    try (Connection conn = DBUtil.getConnection();
                         PreparedStatement stmt = conn.prepareStatement("SELECT group_limit FROM projects WHERE id = ?")) {
                        stmt.setInt(1, selectedProjectId);
                        try (ResultSet rs = stmt.executeQuery()) {
                            rs.next();
                            int groupLimit = rs.getInt("group_limit");
                            setGraphic(Integer.parseInt(group.getMemberCount()) >= groupLimit ? null : joinButton);
                        }
                    } catch (SQLException e) {
                        setGraphic(null);
                    }
                }
            }
        });
    }

    private void setupViewTasksColumn() {
        viewTasksCol.setCellFactory(param -> new TableCell<>() {
            private final Button viewButton = new Button("View");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    GroupTab group = getTableView().getItems().get(getIndex());
                    viewButton.getStyleClass().add("card-button");
                    viewButton.setOnAction(event -> {
                        selectedGroupId = group.getGroupId();
                        tasksSectionTitle.setText("Tasks for " + group.getName());
                        loadTasks();
                    });
                    
                    if (isAdminOrFaculty) {
                        setGraphic(viewButton);
                    } else {
                        try (Connection conn = DBUtil.getConnection();
                             PreparedStatement stmt = conn.prepareStatement(
                                 "SELECT id FROM group_memberships WHERE group_id = ? AND user_id = (SELECT id FROM users WHERE email = ?) AND status = 'accepted'")) {
                            stmt.setInt(1, group.getGroupId());
                            stmt.setString(2, currentEmail);
                            try (ResultSet rs = stmt.executeQuery()) {
                                setGraphic(rs.next() ? viewButton : null);
                            }
                        } catch (SQLException e) {
                            setGraphic(null);
                        }
                    }
                }
            }
        });
    }

    private void setupTaskActionsColumn() {
        taskActionsCol.setCellFactory(param -> new TableCell<>() {
            private final ComboBox<String> statusCombo = new ComboBox<>();
            private final Button deleteButton = new Button("Delete");
            private final HBox hbox = new HBox(5);

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    TaskTab task = getTableView().getItems().get(getIndex());
                    statusCombo.getItems().setAll("Pending", "Complete");
                    statusCombo.setValue(task.getStatus());
                    statusCombo.getStyleClass().add("card-button");
                    deleteButton.getStyleClass().add("card-button");
                    hbox.getStyleClass().add("actions-hbox");
                    hbox.getChildren().clear();
                    
                    if (isAdminOrFaculty) {
                        hbox.getChildren().addAll(statusCombo, deleteButton);
                        statusCombo.setOnAction(event -> {
                            String newStatus = statusCombo.getValue();
                            String dbStatus = newStatus.equals("Complete") ? "completed" : "pending";
                            updateTaskStatus(task, dbStatus);
                        });
                        deleteButton.setOnAction(event -> deleteTask(task));
                        setGraphic(hbox);
                    } 
                    else if (isStudent) {
                        try (Connection conn = DBUtil.getConnection();
                             PreparedStatement stmt = conn.prepareStatement(
                                 "SELECT assigned_to_id FROM tasks WHERE id = ?")) {
                            stmt.setInt(1, task.getId());
                            try (ResultSet rs = stmt.executeQuery()) {
                                if (rs.next()) {
                                    Integer assignedToId = rs.getObject("assigned_to_id", Integer.class);
                                    
                                    if (assignedToId == null) {
                                        hbox.getChildren().add(statusCombo);
                                        statusCombo.setOnAction(event -> {
                                            String newStatus = statusCombo.getValue();
                                            String dbStatus = newStatus.equals("Complete") ? "completed" : "pending";
                                            updateTaskStatusAsStudent(task, dbStatus);
                                        });
                                        setGraphic(hbox);
                                    } else {
                                        PreparedStatement userStmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?");
                                        userStmt.setString(1, currentEmail);
                                        try (ResultSet userRs = userStmt.executeQuery()) {
                                            if (userRs.next() && userRs.getInt("id") == assignedToId) {
                                                hbox.getChildren().add(statusCombo);
                                                statusCombo.setOnAction(event -> {
                                                    String newStatus = statusCombo.getValue();
                                                    String dbStatus = newStatus.equals("Complete") ? "completed" : "pending";
                                                    updateTaskStatusAsStudent(task, dbStatus);
                                                });
                                                setGraphic(hbox);
                                            } else {
                                                setGraphic(null);
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (SQLException e) {
                            setGraphic(null);
                        }
                    } else {
                        setGraphic(null);
                    }
                }
            }
        });
    }

    private void setupRequestActionsColumn() {
        requestActionsCol.setCellFactory(param -> new TableCell<>() {
            private final Button acceptButton = new Button("Accept");
            private final Button rejectButton = new Button("Reject");
            private final HBox hbox = new HBox(5);

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    JoinRequestTab request = getTableView().getItems().get(getIndex());
                    acceptButton.getStyleClass().add("card-button");
                    rejectButton.getStyleClass().add("card-button");
                    hbox.getStyleClass().add("actions-hbox");
                    hbox.getChildren().clear();
                    hbox.getChildren().addAll(acceptButton, rejectButton);
                    acceptButton.setOnAction(event -> handleJoinRequest(request, "accepted"));
                    rejectButton.setOnAction(event -> handleJoinRequest(request, "rejected"));
                    setGraphic(hbox);
                }
            }
        });
    }

    private void updateTaskStatusAsStudent(TaskTab task, String newStatus) {
        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?");
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    showAlert("Error", "User not found for email: " + currentEmail);
                    return;
                }
                int userId = rs.getInt("id");

                stmt = conn.prepareStatement(
                    "SELECT id FROM group_memberships WHERE group_id = ? AND user_id = ? AND status = 'accepted'");
                stmt.setInt(1, selectedGroupId);
                stmt.setInt(2, userId);
                try (ResultSet rs2 = stmt.executeQuery()) {
                    if (!rs2.next()) {
                        showAlert("Error", "You must be a member of the group to update task status.");
                        return;
                    }
                }

                stmt = conn.prepareStatement(
                    "UPDATE tasks SET status = ? WHERE id = ?");
                stmt.setString(1, newStatus);
                stmt.setInt(2, task.getId());
                stmt.executeUpdate();
                String displayStatus = newStatus.equals("completed") ? "Complete" : "Pending";
                showAlert("Success", "Task status updated to " + displayStatus + ".");
                loadTasks();
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to update task status: " + e.getMessage());
        }
    }

    private void updateTaskStatus(TaskTab task, String newStatus) {
        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement(
                "UPDATE tasks SET status = ? WHERE id = ?");
            stmt.setString(1, newStatus);
            stmt.setInt(2, task.getId());
            stmt.executeUpdate();
            String displayStatus = newStatus.equals("completed") ? "Complete" : "Pending";
            showAlert("Success", "Task status updated to " + displayStatus + ".");
            loadTasks();
        } catch (SQLException e) {
            showAlert("Error", "Failed to update task status: " + e.getMessage());
        }
    }

    private void deleteTask(TaskTab task) {
        if (!isAdminOrFaculty) {
            showAlert("Error", "Only admins and faculty can delete tasks.");
            return;
        }

        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirm Delete");
        confirm.setHeaderText(null);
        confirm.setContentText("Are you sure you want to delete task: " + task.getTitle() + "?");
        confirm.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                try (Connection conn = DBUtil.getConnection();
                     PreparedStatement deleteStmt = conn.prepareStatement("DELETE FROM tasks WHERE id = ?")) {
                    deleteStmt.setInt(1, task.getId());
                    deleteStmt.executeUpdate();
                    showAlert("Success", "Task deleted successfully.");
                    loadTasks();
                } catch (SQLException e) {
                    showAlert("Error", "Failed to delete task: " + e.getMessage());
                }
            }
        });
    }

    private void joinGroup(GroupTab group) {
        if (!isStudent) {
            showAlert("Error", "Only students can join groups.");
            return;
        }
        if (currentEmail == null || currentEmail.isEmpty()) {
            showAlert("Error", "Please log in to join a group.");
            return;
        }

        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?");
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    showAlert("Error", "User not found for email: " + currentEmail);
                    return;
                }
                int userId = rs.getInt("id");

                stmt = conn.prepareStatement(
                    "SELECT id FROM group_memberships WHERE user_id = ? AND group_id IN (SELECT group_id FROM project_groups WHERE project_id = ?) AND status = 'accepted'");
                stmt.setInt(1, userId);
                stmt.setInt(2, selectedProjectId);
                try (ResultSet rs2 = stmt.executeQuery()) {
                    if (rs2.next()) {
                        showAlert("Error", "You are already a member of a group for this project.");
                        return;
                    }
                }

                stmt = conn.prepareStatement(
                    "SELECT status FROM group_memberships WHERE group_id = ? AND user_id = ?");
                stmt.setInt(1, group.getGroupId());
                stmt.setInt(2, userId);
                try (ResultSet rs2 = stmt.executeQuery()) {
                    if (rs2.next()) {
                        String status = rs2.getString("status");
                        showAlert("Information", "You have already " + (status.equals("pending") ? "requested to join" : status) + " this group.");
                        return;
                    }
                }

                stmt = conn.prepareStatement(
                    "SELECT COUNT(*) AS count FROM group_memberships WHERE group_id = ? AND status = 'accepted'");
                stmt.setInt(1, group.getGroupId());
                try (ResultSet rs2 = stmt.executeQuery()) {
                    rs2.next();
                    int memberCount = rs2.getInt("count");
                    stmt = conn.prepareStatement("SELECT group_limit FROM projects WHERE id = ?");
                    stmt.setInt(1, selectedProjectId);
                    try (ResultSet rs3 = stmt.executeQuery()) {
                        rs3.next();
                        int groupLimit = rs3.getInt("group_limit");
                        if (memberCount >= groupLimit) {
                            showAlert("Error", "Group has reached its limit of " + groupLimit + " members.");
                            return;
                        }
                    }
                }

                stmt = conn.prepareStatement(
                    "INSERT INTO group_memberships (group_id, user_id, status, joined_at) VALUES (?, ?, 'pending', CURRENT_TIMESTAMP)");
                stmt.setInt(1, group.getGroupId());
                stmt.setInt(2, userId);
                stmt.executeUpdate();
                showAlert("Success", "Join request sent for group: " + group.getName());
                loadGroups();
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to send join request: " + e.getMessage());
        }
    }

    private void handleJoinRequest(JoinRequestTab request, String newStatus) {
        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?");
            stmt.setString(1, currentEmail);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    showAlert("Error", "User not found for email: " + currentEmail);
                    return;
                }
                int userId = rs.getInt("id");

                stmt = conn.prepareStatement(
                    "SELECT creator_id FROM project_groups WHERE group_id = ?");
                stmt.setInt(1, request.getGroupId());
                try (ResultSet rs2 = stmt.executeQuery()) {
                    if (!rs2.next() || rs2.getInt("creator_id") != userId) {
                        showAlert("Error", "Only the group creator can manage join requests.");
                        return;
                    }
                }

                if ("accepted".equals(newStatus)) {
                    stmt = conn.prepareStatement(
                        "SELECT COUNT(*) AS count FROM group_memberships WHERE group_id = ? AND status = 'accepted'");
                    stmt.setInt(1, request.getGroupId());
                    try (ResultSet rs2 = stmt.executeQuery()) {
                        rs2.next();
                        int currentCount = rs2.getInt("count");
                        stmt = conn.prepareStatement(
                            "SELECT group_limit FROM projects WHERE id = (SELECT project_id FROM project_groups WHERE group_id = ?)");
                        stmt.setInt(1, request.getGroupId());
                        try (ResultSet rs3 = stmt.executeQuery()) {
                            rs3.next();
                            int groupLimit = rs3.getInt("group_limit");
                            if (currentCount >= groupLimit) {
                                showAlert("Error", "Cannot accept: Group has reached its limit of " + groupLimit + " members.");
                                return;
                            }
                        }
                    }
                }

                stmt = conn.prepareStatement(
                    "UPDATE group_memberships SET status = ? WHERE id = ?");
                stmt.setString(1, newStatus);
                stmt.setInt(2, request.getId());
                stmt.executeUpdate();
                showAlert("Success", "Join request " + newStatus + " for user: " + request.getUserEmail());
                loadGroups();
                loadJoinRequests();
            }
        } catch (SQLException e) {
            showAlert("Error", "Failed to process join request: " + e.getMessage());
        }
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
                    if (controller instanceof HomepageController) {
                        ((HomepageController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AnnouncementController) {
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

    public static class ProjectTab {
        private final SimpleStringProperty title;
        private final SimpleStringProperty description;
        private final SimpleStringProperty groupLimit;
        private final SimpleStringProperty groupCount;
        private final SimpleStringProperty createdAt;
        private final int id;

        public ProjectTab(int id, String title, String description, int groupLimit, int groupCount, String createdAt) {
            this.id = id;
            this.title = new SimpleStringProperty(title);
            this.description = new SimpleStringProperty(description);
            this.groupLimit = new SimpleStringProperty(String.valueOf(groupLimit));
            this.groupCount = new SimpleStringProperty(String.valueOf(groupCount));
            this.createdAt = new SimpleStringProperty(createdAt);
        }

        public int getId() { return id; }
        public String getTitle() { return title.get(); }
        public String getDescription() { return description.get(); }
        public String getGroupLimit() { return groupLimit.get(); }
        public String getGroupCount() { return groupCount.get(); }
        public String getCreatedAt() { return createdAt.get(); }
        public StringProperty titleProperty() { return title; }
        public StringProperty descriptionProperty() { return description; }
        public StringProperty groupLimitProperty() { return groupLimit; }
        public StringProperty groupCountProperty() { return groupCount; }
        public StringProperty createdAtProperty() { return createdAt; }
    }

    public static class GroupTab {
        private final SimpleStringProperty name;
        private final SimpleStringProperty creatorEmail;
        private final SimpleStringProperty memberCount;
        private final SimpleStringProperty createdAt;
        private final int groupId;

        public GroupTab(int groupId, String name, String creatorEmail, int memberCount, String createdAt) {
            this.groupId = groupId;
            this.name = new SimpleStringProperty(name);
            this.creatorEmail = new SimpleStringProperty(creatorEmail);
            this.memberCount = new SimpleStringProperty(String.valueOf(memberCount));
            this.createdAt = new SimpleStringProperty(createdAt);
        }

        public int getGroupId() { return groupId; }
        public String getName() { return name.get(); }
        public String getCreatorEmail() { return creatorEmail.get(); }
        public String getMemberCount() { return memberCount.get(); }
        public String getCreatedAt() { return createdAt.get(); }
        public StringProperty nameProperty() { return name; }
        public StringProperty creatorEmailProperty() { return creatorEmail; }
        public StringProperty memberCountProperty() { return memberCount; }
        public StringProperty createdAtProperty() { return createdAt; }
    }

    public static class TaskTab {
        private final SimpleStringProperty title;
        private final SimpleStringProperty description;
        private final SimpleStringProperty assignedTo;
        private final SimpleStringProperty status;
        private final SimpleStringProperty createdAt;
        private final int id;

        public TaskTab(int id, String title, String description, String assignedTo, String status, String createdAt) {
            this.id = id;
            this.title = new SimpleStringProperty(title);
            this.description = new SimpleStringProperty(description);
            this.assignedTo = new SimpleStringProperty(assignedTo);
            this.status = new SimpleStringProperty(status);
            this.createdAt = new SimpleStringProperty(createdAt);
        }

        public int getId() { return id; }
        public String getTitle() { return title.get(); }
        public String getDescription() { return description.get(); }
        public String getAssignedTo() { return assignedTo.get(); }
        public String getStatus() { return status.get(); }
        public String getCreatedAt() { return createdAt.get(); }
        public StringProperty titleProperty() { return title; }
        public StringProperty descriptionProperty() { return description; }
        public StringProperty assignedToProperty() { return assignedTo; }
        public StringProperty statusProperty() { return status; }
        public StringProperty createdAtProperty() { return createdAt; }
    }

    public static class JoinRequestTab {
        private final SimpleStringProperty userEmail;
        private final SimpleStringProperty status;
        private final int id;
        private final int groupId;

        public JoinRequestTab(int id, int groupId, String userEmail, String status) {
            this.id = id;
            this.groupId = groupId;
            this.userEmail = new SimpleStringProperty(userEmail);
            this.status = new SimpleStringProperty(status);
        }

        public int getId() { return id; }
        public int getGroupId() { return groupId; }
        public String getUserEmail() { return userEmail.get(); }
        public String getStatus() { return status.get(); }
        public StringProperty userEmailProperty() { return userEmail; }
        public StringProperty statusProperty() { return status; }
    }
}
