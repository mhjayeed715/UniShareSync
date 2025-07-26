package unisharesync.ui;

import java.io.File;
import java.net.URL;
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
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.geometry.Insets;

public class AnnouncementController implements Initializable {

    @FXML private Button menuButton;
    @FXML private VBox sidebar;
    @FXML private AnchorPane contentArea;
    @FXML private Label roleLabel;
    @FXML private Button dashboardButton;
    @FXML private Button announcementsButton;
    @FXML private Button resourcesButton;
    @FXML private Button projectsButton;
    @FXML private Button profileButton;
    @FXML private Button logoutButton;
    @FXML private Button adminDashboardButton;
    @FXML private TextField searchAnnouncementField;
    @FXML private Button searchAnnouncementButton;
    @FXML private ComboBox<String> departmentFilterCombo;
    @FXML private Button filterByDepartmentButton;
    @FXML private Button viewSavedButton;
    @FXML private Button viewAllButton;
    @FXML private TableView<AnnouncementTab> announcementsTable;
    @FXML private TableColumn<AnnouncementTab, String> announcementTitleCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementContentCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementDepartmentCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementTimestampCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementPriorityCol;
    @FXML private TableColumn<AnnouncementTab, Void> viewDetailsCol;
    @FXML private TableColumn<AnnouncementTab, Void> saveAnnouncementCol;
    @FXML private HBox editControls;
    @FXML private TextField addAnnouncementTitleField;
    @FXML private TextField addAnnouncementContentField;
    @FXML private ComboBox<String> addAnnouncementDepartmentCombo;
    @FXML private TextField addAnnouncementImagePathField;
    @FXML private TextField addAnnouncementPriorityField;
    @FXML private Button addAnnouncementButton;
    @FXML private TextField updateAnnouncementTitleField;
    @FXML private TextField updateAnnouncementContentField;
    @FXML private ComboBox<String> updateAnnouncementDepartmentCombo;
    @FXML private TextField updateAnnouncementImagePathField;
    @FXML private TextField updateAnnouncementPriorityField;
    @FXML private Button updateAnnouncementButton;
    @FXML private Button deleteAnnouncementButton;

    private String currentEmail;
    private boolean isAdmin = false;
    private boolean isFaculty = false;
    private int currentUserId = -1;
    private AnnouncementTab selectedAnnouncement = null; // Track selected announcement

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("AnnouncementController initializing...");
        announcementTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        announcementContentCol.setCellValueFactory(new PropertyValueFactory<>("contentSnippet"));
        announcementDepartmentCol.setCellValueFactory(new PropertyValueFactory<>("department"));
        announcementTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
        announcementPriorityCol.setCellValueFactory(new PropertyValueFactory<>("priority"));
        setupViewDetailsColumn();
        setupSaveAnnouncementColumn();
        setupTableRowSelection(); // Add this new method
        loadDepartments();
        if (currentEmail != null) {
            loadUserRole();
            viewAnnouncements();
        }
        System.out.println("AnnouncementController initialized");
    }

    private void setupTableRowSelection() {
        announcementsTable.setRowFactory(tv -> {
            TableRow<AnnouncementTab> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (!row.isEmpty() && (isAdmin || isFaculty)) {
                    AnnouncementTab clickedAnnouncement = row.getItem();
                    selectAnnouncementForEdit(clickedAnnouncement);
                    
                    announcementsTable.getSelectionModel().select(clickedAnnouncement);
                }
            });
            return row;
        });
    }

    private void selectAnnouncementForEdit(AnnouncementTab announcement) {
        selectedAnnouncement = announcement;
        
        updateAnnouncementTitleField.setText(announcement.getTitle());
        updateAnnouncementContentField.setText(announcement.getContent());
        updateAnnouncementDepartmentCombo.setValue(announcement.getDepartment());
        updateAnnouncementImagePathField.setText(announcement.getImagePath() != null ? announcement.getImagePath() : "");
        updateAnnouncementPriorityField.setText(announcement.getPriority());
        
        System.out.println("Selected announcement: " + announcement.getTitle() + " for editing");
        
        showAlert("Selection", "Announcement '" + announcement.getTitle() + "' selected for editing. Update fields have been populated.");
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email;
        if (currentEmail != null) {
            System.out.println("Setting current email: " + currentEmail);
            loadUserRole();
            viewAnnouncements();
            updateRoleBasedVisibility();
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
                    isFaculty = "faculty".equalsIgnoreCase(role);
                    String roleText = isAdmin ? "Admin" : isFaculty ? "Faculty" : "Student";
                    roleLabel.setText("Role: " + roleText);
                    adminDashboardButton.setVisible(isAdmin);
                    updateRoleBasedVisibility();
                    System.out.println("User role loaded: " + roleText);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load user role: " + e.getMessage());
        }
    }

    private void loadDepartments() {
        ObservableList<String> departments = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT DISTINCT department FROM announcements WHERE department IS NOT NULL ORDER BY department")) {
            try (ResultSet rs = stmt.executeQuery()) {
                departments.add("All Departments");
                while (rs.next()) {
                    departments.add(rs.getString("department"));
                }
            }
            departmentFilterCombo.setItems(departments);
            departmentFilterCombo.setValue("All Departments");
            
            if (addAnnouncementDepartmentCombo != null) {
                ObservableList<String> addDepartments = FXCollections.observableArrayList();
                addDepartments.addAll("General", "CSE", "LAW", "CSIT", "GDM");
                addAnnouncementDepartmentCombo.setItems(addDepartments);
                addAnnouncementDepartmentCombo.setValue("General");
            }
            
            if (updateAnnouncementDepartmentCombo != null) {
                updateAnnouncementDepartmentCombo.setItems(addAnnouncementDepartmentCombo.getItems());
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load departments: " + e.getMessage());
        }
    }

    @FXML
    private void filterByDepartment() {
        String selectedDepartment = departmentFilterCombo.getValue();
        if (selectedDepartment == null || selectedDepartment.equals("All Departments")) {
            viewAnnouncements();
            return;
        }
        
        ObservableList<AnnouncementTab> announcements = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT id, title, content, department, created_at, priority, image_path FROM announcements WHERE department = ? ORDER BY created_at DESC")) {
            stmt.setString(1, selectedDepartment);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String content = rs.getString("content");
                    String snippet = content != null && content.length() > 100 ? content.substring(0, 100) + "..." : content;
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    String department = rs.getString("department") != null ? rs.getString("department") : "General";
                    String priority = rs.getString("priority") != null ? rs.getString("priority") : "Normal";
                    String imagePath = rs.getString("image_path") != null ? rs.getString("image_path") : "";
                    announcements.add(new AnnouncementTab(rs.getInt("id"), rs.getString("title"), content, snippet, department, createdAt, priority, imagePath));
                }
            }
            announcementsTable.setItems(announcements);
            System.out.println("Loaded " + announcements.size() + " announcements for department: " + selectedDepartment);
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to filter announcements: " + e.getMessage());
        }
    }

    @FXML
    private void viewSavedAnnouncements() {
        if (currentUserId == -1) {
            showAlert("Error", "Please log in to view saved announcements.");
            return;
        }
        
        ObservableList<AnnouncementTab> announcements = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT a.id, a.title, a.content, a.department, a.created_at, a.priority, a.image_path " +
                 "FROM announcements a JOIN saved_announcements sa ON a.id = sa.announcement_id " +
                 "WHERE sa.user_id = ? ORDER BY sa.saved_at DESC")) {
            stmt.setInt(1, currentUserId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String content = rs.getString("content");
                    String snippet = content != null && content.length() > 100 ? content.substring(0, 100) + "..." : content;
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    String department = rs.getString("department") != null ? rs.getString("department") : "General";
                    String priority = rs.getString("priority") != null ? rs.getString("priority") : "Normal";
                    String imagePath = rs.getString("image_path") != null ? rs.getString("image_path") : "";
                    announcements.add(new AnnouncementTab(rs.getInt("id"), rs.getString("title"), content, snippet, department, createdAt, priority, imagePath));
                }
            }
            announcementsTable.setItems(announcements);
            System.out.println("Loaded " + announcements.size() + " saved announcements");
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load saved announcements: " + e.getMessage());
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
    private void goToDashboard(ActionEvent event) {
        navigateTo("/unisharesync/ui/dashboard.fxml");
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
    private void handleLogout(ActionEvent event) {
        navigateTo("/unisharesync/ui/login.fxml");
    }

    @FXML
    private void goToAdminDashboard(ActionEvent event) {
        navigateTo("/unisharesync/ui/admin_dashboard.fxml");
    }

    @FXML
    private void searchAnnouncements() {
        String searchTerm = searchAnnouncementField.getText().trim();
        ObservableList<AnnouncementTab> announcements = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT id, title, content, department, created_at, priority, image_path FROM announcements WHERE title LIKE ? ORDER BY created_at DESC")) {
            stmt.setString(1, "%" + searchTerm + "%");
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String content = rs.getString("content");
                    String snippet = content != null && content.length() > 100 ? content.substring(0, 100) + "..." : content;
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    String department = rs.getString("department") != null ? rs.getString("department") : "General";
                    String priority = rs.getString("priority") != null ? rs.getString("priority") : "Normal";
                    String imagePath = rs.getString("image_path") != null ? rs.getString("image_path") : "";
                    announcements.add(new AnnouncementTab(rs.getInt("id"), rs.getString("title"), content, snippet, department, createdAt, priority, imagePath));
                }
            }
            announcementsTable.setItems(announcements);
            System.out.println("Loaded " + announcements.size() + " announcements");
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to search announcements: " + e.getMessage());
        }
    }

    @FXML
    private void viewAnnouncements() {
        searchAnnouncementField.clear();
        departmentFilterCombo.setValue("All Departments");
        searchAnnouncements();
    }

    @FXML
    private void addAnnouncement(ActionEvent event) {
        if (!isAdmin && !isFaculty) {
            showAlert("Access Denied", "Only admins and faculty can add announcements!");
            return;
        }
        String title = addAnnouncementTitleField.getText().trim();
        String content = addAnnouncementContentField.getText().trim();
        String department = addAnnouncementDepartmentCombo.getValue();
        String imagePath = addAnnouncementImagePathField.getText().trim();
        String priority = addAnnouncementPriorityField.getText().trim();
        
        if (title.isEmpty() || content.isEmpty()) {
            showAlert("Error", "Title and content are required.");
            return;
        }
        
        if (department == null || department.isEmpty()) {
            department = "General";
        }
        
        try (Connection conn = DBUtil.getConnection()) {
            String sql = "INSERT INTO announcements (title, content, department, image_path, user_id, priority) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, content);
            stmt.setString(3, department);
            stmt.setString(4, imagePath.isEmpty() ? null : imagePath);
            stmt.setInt(5, currentUserId);
            stmt.setString(6, priority.isEmpty() ? "1" : priority);
            stmt.executeUpdate();
            showAlert("Success", "Announcement added successfully!");
            clearAnnouncementFields();
            viewAnnouncements();
            loadDepartments();
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to add announcement: " + e.getMessage());
        }
    }

    @FXML
    private void updateAnnouncement(ActionEvent event) {
        if (!isAdmin && !isFaculty) {
            showAlert("Access Denied", "Only admins and faculty can update announcements!");
            return;
        }
        
        if (selectedAnnouncement != null) {
            updateSelectedAnnouncement();
        } else {
            updateAnnouncementByTitle();
        }
    }

    private void updateSelectedAnnouncement() {
        String content = updateAnnouncementContentField.getText().trim();
        String department = updateAnnouncementDepartmentCombo.getValue();
        String imagePath = updateAnnouncementImagePathField.getText().trim();
        String priority = updateAnnouncementPriorityField.getText().trim();
        
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
            if (!imagePath.isEmpty()) {
                sql.append("image_path = ?, ");
                hasUpdate = true;
            }
            if (!priority.isEmpty()) {
                sql.append("priority = ?, ");
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
            if (!imagePath.isEmpty()) {
                stmt.setString(paramIndex++, imagePath);
            }
            if (!priority.isEmpty()) {
                stmt.setString(paramIndex++, priority);
            }
            stmt.setInt(paramIndex, selectedAnnouncement.getId());
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Announcement updated successfully!");
                clearAnnouncementFields();
                selectedAnnouncement = null;
                viewAnnouncements();
                loadDepartments();
            } else {
                showAlert("Error", "Failed to update announcement.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update announcement: " + e.getMessage());
        }
    }

    private void updateAnnouncementByTitle() {
        String title = updateAnnouncementTitleField.getText().trim();
        String content = updateAnnouncementContentField.getText().trim();
        String department = updateAnnouncementDepartmentCombo.getValue();
        String imagePath = updateAnnouncementImagePathField.getText().trim();
        String priority = updateAnnouncementPriorityField.getText().trim();
        
        if (title.isEmpty()) {
            showAlert("Error", "Title is required or please select an announcement from the table.");
            return;
        }
        
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
            if (!imagePath.isEmpty()) {
                sql.append("image_path = ?, ");
                hasUpdate = true;
            }
            if (!priority.isEmpty()) {
                sql.append("priority = ?, ");
                hasUpdate = true;
            }
            
            if (!hasUpdate) {
                showAlert("Error", "No fields to update.");
                return;
            }
            
            sql.setLength(sql.length() - 2);
            sql.append(" WHERE title = ?");
            
            PreparedStatement stmt = conn.prepareStatement(sql.toString());
            int paramIndex = 1;
            
            if (!content.isEmpty()) {
                stmt.setString(paramIndex++, content);
            }
            if (department != null && !department.isEmpty()) {
                stmt.setString(paramIndex++, department);
            }
            if (!imagePath.isEmpty()) {
                stmt.setString(paramIndex++, imagePath);
            }
            if (!priority.isEmpty()) {
                stmt.setString(paramIndex++, priority);
            }
            stmt.setString(paramIndex, title);
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Announcement updated successfully!");
                clearAnnouncementFields();
                viewAnnouncements();
                loadDepartments();
            } else {
                showAlert("Error", "No announcement found with the given title.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to update announcement: " + e.getMessage());
        }
    }

    @FXML
    private void deleteAnnouncement(ActionEvent event) {
        if (!isAdmin && !isFaculty) {
            showAlert("Access Denied", "Only admins and faculty can delete announcements!");
            return;
        }
        
        AnnouncementTab announcementToDelete = selectedAnnouncement != null ? 
            selectedAnnouncement : announcementsTable.getSelectionModel().getSelectedItem();
            
        if (announcementToDelete == null) {
            showAlert("Error", "Please select an announcement to delete by clicking on it.");
            return;
        }
        
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirm Delete");
        confirmAlert.setHeaderText(null);
        confirmAlert.setContentText("Are you sure you want to delete the announcement: '" + 
            announcementToDelete.getTitle() + "'?");
        
        if (confirmAlert.showAndWait().get() == ButtonType.OK) {
            try (Connection conn = DBUtil.getConnection()) {
                String sql = "DELETE FROM announcements WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, announcementToDelete.getId());
                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    showAlert("Success", "Announcement deleted successfully!");
                    clearAnnouncementFields();
                    selectedAnnouncement = null;
                    viewAnnouncements();
                    loadDepartments();
                } else {
                    showAlert("Error", "Failed to delete announcement.");
                }
            } catch (SQLException e) {
                e.printStackTrace();
                showAlert("Error", "Failed to delete announcement: " + e.getMessage());
            }
        }
    }

    private void setupViewDetailsColumn() {
        viewDetailsCol.setCellFactory(param -> new TableCell<AnnouncementTab, Void>() {
            private final Button viewButton = new Button("View");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    viewButton.getStyleClass().add("card-button");
                    viewButton.setOnAction(event -> {
                        AnnouncementTab announcement = getTableView().getItems().get(getIndex());
                        showAnnouncementDetails(announcement);
                    });
                    setGraphic(viewButton);
                }
            }
        });
    }

    private void setupSaveAnnouncementColumn() {
        saveAnnouncementCol.setCellFactory(param -> new TableCell<AnnouncementTab, Void>() {
            private final Button saveButton = new Button("Save");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || currentUserId == -1) {
                    setGraphic(null);
                } else {
                    AnnouncementTab announcement = getTableView().getItems().get(getIndex());
                    saveButton.getStyleClass().add("card-button");
                    
                    if (isAnnouncementSaved(announcement.getId())) {
                        saveButton.setText("Unsave");
                        saveButton.setOnAction(event -> unsaveAnnouncement(announcement));
                    } else {
                        saveButton.setText("Save");
                        saveButton.setOnAction(event -> saveAnnouncement(announcement));
                    }
                    setGraphic(saveButton);
                }
            }
        });
    }

    private boolean isAnnouncementSaved(int announcementId) {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT id FROM saved_announcements WHERE user_id = ? AND announcement_id = ?")) {
            stmt.setInt(1, currentUserId);
            stmt.setInt(2, announcementId);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private void saveAnnouncement(AnnouncementTab announcement) {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO saved_announcements (user_id, announcement_id) VALUES (?, ?)")) {
            stmt.setInt(1, currentUserId);
            stmt.setInt(2, announcement.getId());
            stmt.executeUpdate();
            showAlert("Success", "Announcement saved successfully!");
            announcementsTable.refresh();
        } catch (SQLException e) {
            if (e.getMessage().contains("Duplicate entry")) {
                showAlert("Info", "Announcement is already saved.");
            } else {
                e.printStackTrace();
                showAlert("Error", "Failed to save announcement: " + e.getMessage());
            }
        }
    }

    private void unsaveAnnouncement(AnnouncementTab announcement) {
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM saved_announcements WHERE user_id = ? AND announcement_id = ?")) {
            stmt.setInt(1, currentUserId);
            stmt.setInt(2, announcement.getId());
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected > 0) {
                showAlert("Success", "Announcement unsaved successfully!");
                announcementsTable.refresh();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to unsave announcement: " + e.getMessage());
        }
    }

    private void showAnnouncementDetails(AnnouncementTab announcement) {
        Stage popup = new Stage();
        VBox vbox = new VBox(10);
        vbox.setPadding(new Insets(15));
        vbox.getStyleClass().add("popup-content");

        Label titleLabel = new Label(announcement.getTitle());
        titleLabel.getStyleClass().add("popup-title");
        
        Label departmentLabel = new Label("Department: " + announcement.getDepartment());
        departmentLabel.getStyleClass().add("popup-subtitle");
        
        Label priorityLabel = new Label("Priority: " + announcement.getPriority());
        priorityLabel.getStyleClass().add("popup-subtitle");
        
        TextArea contentArea = new TextArea(announcement.getContent());
        contentArea.setEditable(false);
        contentArea.setWrapText(true);
        contentArea.setPrefHeight(200);
        contentArea.getStyleClass().add("form-input");
        
        Label timestampLabel = new Label("Posted on: " + announcement.getCreatedAt());
        timestampLabel.getStyleClass().add("popup-timestamp");
        
        ImageView imageView = new ImageView();
        if (announcement.getImagePath() != null && !announcement.getImagePath().isEmpty()) {
            try {
                imageView.setImage(new javafx.scene.image.Image(new File(announcement.getImagePath()).toURI().toString()));
                imageView.setFitWidth(300);
                imageView.setPreserveRatio(true);
            } catch (Exception e) {
                System.out.println("Failed to load image: " + e.getMessage());
            }
        }
        
        Button closeButton = new Button("Close");
        closeButton.getStyleClass().add("card-button");
        closeButton.setOnAction(e -> popup.close());

        vbox.getChildren().addAll(titleLabel, departmentLabel, priorityLabel, contentArea, timestampLabel, imageView, closeButton);
        Scene scene = new Scene(vbox, 450, 500);
        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        popup.setScene(scene);
        popup.setTitle("Announcement Details");
        popup.show();
    }

    private void clearAnnouncementFields() {
        addAnnouncementTitleField.clear();
        addAnnouncementContentField.clear();
        addAnnouncementImagePathField.clear();
        addAnnouncementPriorityField.clear();
        updateAnnouncementTitleField.clear();
        updateAnnouncementContentField.clear();
        updateAnnouncementImagePathField.clear();
        updateAnnouncementPriorityField.clear();
        selectedAnnouncement = null; 
        if (addAnnouncementDepartmentCombo != null) {
            addAnnouncementDepartmentCombo.setValue("General");
        }
        if (updateAnnouncementDepartmentCombo != null) {
            updateAnnouncementDepartmentCombo.setValue(null);
        }
    }

    private void updateRoleBasedVisibility() {
        boolean isEditable = isAdmin || isFaculty;
        editControls.setVisible(isEditable);
        editControls.setManaged(isEditable);
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
                    } else if (controller instanceof DashboardController) {
                        ((DashboardController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AdminDashboardController) {
                        ((AdminDashboardController) controller).setCurrentEmail(currentEmail);
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
            } catch (Exception e) {
                showAlert("Error", "Failed to navigate: " + e.getMessage());
                e.printStackTrace();
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
}