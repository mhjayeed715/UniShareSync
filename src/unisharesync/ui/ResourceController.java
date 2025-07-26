package unisharesync.ui;

import java.awt.Desktop;
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
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

public class ResourceController implements Initializable {

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

    @FXML private TextField searchResourceField;
    @FXML private Button searchResourceButton;
    @FXML private ComboBox<String> categoryFilterCombo;
    @FXML private ComboBox<String> subjectFilterCombo;
    @FXML private ComboBox<String> typeFilterCombo;
    @FXML private Button filterResourcesButton;
    @FXML private Button viewAllResourcesButton;
    @FXML private Button myResourcesButton;

    @FXML private VBox addResourceSection;
    @FXML private TextField addResourceTitleField;
    @FXML private ComboBox<String> addCategoryCombo;
    @FXML private ComboBox<String> addSubjectCombo;
    @FXML private ComboBox<String> addTypeCombo;
    @FXML private TextArea addDescriptionArea;
    @FXML private TextField addResourceFilePathField;
    @FXML private Button addResourceFileButton;
    @FXML private Button addResourceButton;

    @FXML private VBox updateResourceSection;
    @FXML private TextField updateResourceTitleField;
    @FXML private ComboBox<String> updateCategoryCombo;
    @FXML private ComboBox<String> updateSubjectCombo;
    @FXML private ComboBox<String> updateTypeCombo;
    @FXML private TextArea updateDescriptionArea;
    @FXML private TextField updateResourceFilePathField;
    @FXML private Button updateResourceFileButton;
    @FXML private Button updateResourceButton;
    @FXML private Button deleteResourceButton;

    @FXML private TableView<ResourceTab> resourcesTable;
    @FXML private TableColumn<ResourceTab, String> resourceTitleCol;
    @FXML private TableColumn<ResourceTab, String> resourceCategoryCol;
    @FXML private TableColumn<ResourceTab, String> resourceSubjectCol;
    @FXML private TableColumn<ResourceTab, String> resourceTypeCol;
    @FXML private TableColumn<ResourceTab, String> resourceUploaderCol;
    @FXML private TableColumn<ResourceTab, String> resourceTimestampCol;
    @FXML private TableColumn<ResourceTab, Void> viewDetailsCol;
    @FXML private TableColumn<ResourceTab, Void> downloadCol;

    private String currentEmail;
    private boolean isAdmin = false;
    private boolean isFaculty = false;
    private int currentUserId = -1;
    private ResourceTab selectedResource = null;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("ResourceController initializing...");
        setupTableColumns();
        setupTableRowSelection();
        setupViewDetailsColumn();
        setupDownloadColumn();
        loadComboBoxData();
        if (currentEmail != null) {
            loadUserRole();
            viewAllResources();
        }
        System.out.println("ResourceController initialized");
    }

    private void setupTableColumns() {
        resourceTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        resourceCategoryCol.setCellValueFactory(new PropertyValueFactory<>("category"));
        resourceSubjectCol.setCellValueFactory(new PropertyValueFactory<>("subject"));
        resourceTypeCol.setCellValueFactory(new PropertyValueFactory<>("resourceType"));
        resourceUploaderCol.setCellValueFactory(new PropertyValueFactory<>("uploaderName"));
        resourceTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
    }

    private void setupTableRowSelection() {
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
    }

    private void selectResourceForEdit(ResourceTab resource) {
        selectedResource = resource;
        
        boolean canEdit = isAdmin || (resource.getUserId() == currentUserId);
        updateResourceSection.setVisible(canEdit);
        updateResourceSection.setManaged(canEdit);
        
        if (canEdit) {
            updateResourceTitleField.setText(resource.getTitle());
            updateCategoryCombo.setValue(resource.getCategory());
            updateSubjectCombo.setValue(resource.getSubject());
            updateTypeCombo.setValue(resource.getResourceType());
            updateDescriptionArea.setText(resource.getDescription());
            updateResourceFilePathField.setText(resource.getFilePath());
            
            showAlert("Selection", "Resource '" + resource.getTitle() + "' selected for editing.");
        }
    }

    private void loadComboBoxData() {
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

        categoryFilterCombo.setItems(FXCollections.observableArrayList("All Categories"));
        categoryFilterCombo.getItems().addAll(categories);
        categoryFilterCombo.setValue("All Categories");
        
        subjectFilterCombo.setItems(FXCollections.observableArrayList("All Subjects"));
        subjectFilterCombo.getItems().addAll(subjects);
        subjectFilterCombo.setValue("All Subjects");
        
        typeFilterCombo.setItems(FXCollections.observableArrayList("All Types"));
        typeFilterCombo.getItems().addAll(types);
        typeFilterCombo.setValue("All Types");

        addCategoryCombo.setItems(categories);
        addCategoryCombo.setValue("General");
        addSubjectCombo.setItems(subjects);
        addSubjectCombo.setValue("General");
        addTypeCombo.setItems(types);
        addTypeCombo.setValue("PDF");

        updateCategoryCombo.setItems(categories);
        updateSubjectCombo.setItems(subjects);
        updateTypeCombo.setItems(types);
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email;
        if (currentEmail != null) {
            System.out.println("Setting current email: " + currentEmail);
            loadUserRole();
            viewAllResources();
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

    @FXML
    private void searchResources() {
        String searchTerm = searchResourceField.getText().trim();
        loadResources("SELECT r.*, u.name as uploader_name FROM resources r LEFT JOIN users u ON r.user_id = u.id WHERE r.title LIKE ? ORDER BY r.created_at DESC", 
                     "%" + searchTerm + "%");
    }

    @FXML
    private void filterResources() {
        String category = categoryFilterCombo.getValue();
        String subject = subjectFilterCombo.getValue();
        String type = typeFilterCombo.getValue();
        
        StringBuilder sql = new StringBuilder("SELECT r.*, u.name as uploader_name FROM resources r LEFT JOIN users u ON r.user_id = u.id WHERE 1=1");
        
        if (category != null && !category.equals("All Categories")) {
            sql.append(" AND r.category = '").append(category).append("'");
        }
        if (subject != null && !subject.equals("All Subjects")) {
            sql.append(" AND r.subject = '").append(subject).append("'");
        }
        if (type != null && !type.equals("All Types")) {
            sql.append(" AND r.resource_type = '").append(type).append("'");
        }
        
        sql.append(" ORDER BY r.created_at DESC");
        loadResources(sql.toString());
    }

    @FXML
    private void viewAllResources() {
        searchResourceField.clear();
        categoryFilterCombo.setValue("All Categories");
        subjectFilterCombo.setValue("All Subjects");
        typeFilterCombo.setValue("All Types");
        loadResources("SELECT r.*, u.name as uploader_name FROM resources r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC");
    }

    @FXML
    private void viewMyResources() {
        if (currentUserId == -1) {
            showAlert("Error", "Please log in to view your resources.");
            return;
        }
        loadResources("SELECT r.*, u.name as uploader_name FROM resources r LEFT JOIN users u ON r.user_id = u.id WHERE r.user_id = ? ORDER BY r.created_at DESC", 
                     String.valueOf(currentUserId));
    }

    private void loadResources(String sql, String... params) {
        ObservableList<ResourceTab> resources = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            for (int i = 0; i < params.length; i++) {
                if (params[i].matches("\\d+")) {
                    stmt.setInt(i + 1, Integer.parseInt(params[i]));
                } else {
                    stmt.setString(i + 1, params[i]);
                }
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
    private void uploadResourceFile(ActionEvent event) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select Resource File");
        fileChooser.getExtensionFilters().addAll(
            new FileChooser.ExtensionFilter("All Files", "*.*"),
            new FileChooser.ExtensionFilter("PDF Files", "*.pdf"),
            new FileChooser.ExtensionFilter("PowerPoint Files", "*.ppt", "*.pptx"),
            new FileChooser.ExtensionFilter("Word Documents", "*.doc", "*.docx"),
            new FileChooser.ExtensionFilter("Images", "*.png", "*.jpg", "*.jpeg", "*.gif"),
            new FileChooser.ExtensionFilter("Archives", "*.zip", "*.rar", "*.7z")
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
                    addTypeCombo.setValue("PDF");
                } else if (fileName.endsWith(".ppt") || fileName.endsWith(".pptx")) {
                    addTypeCombo.setValue("PowerPoint");
                } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
                    addTypeCombo.setValue("Word Document");
                } else if (fileName.matches(".*\\.(png|jpg|jpeg|gif)$")) {
                    addTypeCombo.setValue("Image");
                }
                
                showAlert("Success", "File uploaded successfully!");
            } catch (Exception e) {
                showAlert("Error", "Failed to upload file: " + e.getMessage());
            }
        }
    }

    @FXML
    private void uploadUpdateResourceFile(ActionEvent event) {
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
    private void addResource(ActionEvent event) {
        String title = addResourceTitleField.getText().trim();
        String category = addCategoryCombo.getValue();
        String subject = addSubjectCombo.getValue();
        String resourceType = addTypeCombo.getValue();
        String description = addDescriptionArea.getText().trim();
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
            showAlert("Success", "Resource uploaded successfully!");
            clearAddResourceFields();
            viewAllResources();
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to add resource: " + e.getMessage());
        }
    }

    @FXML
    private void updateResource(ActionEvent event) {
        if (selectedResource == null) {
            showAlert("Error", "Please select a resource to update.");
            return;
        }
        
        if (!isAdmin && selectedResource.getUserId() != currentUserId) {
            showAlert("Access Denied", "You can only update your own resources!");
            return;
        }
        
        String title = updateResourceTitleField.getText().trim();
        String category = updateCategoryCombo.getValue();
        String subject = updateSubjectCombo.getValue();
        String resourceType = updateTypeCombo.getValue();
        String description = updateDescriptionArea.getText().trim();
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
                clearUpdateResourceFields();
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
    private void deleteResource(ActionEvent event) {
        if (selectedResource == null) {
            showAlert("Error", "Please select a resource to delete.");
            return;
        }
        
        // Check permissions
        if (!isAdmin && selectedResource.getUserId() != currentUserId) {
            showAlert("Access Denied", "You can only delete your own resources!");
            return;
        }
        
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Confirm Delete");
        confirmAlert.setHeaderText(null);
        confirmAlert.setContentText("Are you sure you want to delete the resource: '" + 
            selectedResource.getTitle() + "'?");
        
        if (confirmAlert.showAndWait().get() == ButtonType.OK) {
            try (Connection conn = DBUtil.getConnection()) {
                String sql = "DELETE FROM resources WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, selectedResource.getId());
                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    showAlert("Success", "Resource deleted successfully!");
                    clearUpdateResourceFields();
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

    private void setupViewDetailsColumn() {
        viewDetailsCol.setCellFactory(param -> new TableCell<ResourceTab, Void>() {
            private final Button viewButton = new Button("View");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    viewButton.getStyleClass().add("card-button");
                    viewButton.setOnAction(event -> {
                        ResourceTab resource = getTableView().getItems().get(getIndex());
                        showResourceDetails(resource);
                    });
                    setGraphic(viewButton);
                }
            }
        });
    }

    private void setupDownloadColumn() {
        downloadCol.setCellFactory(param -> new TableCell<ResourceTab, Void>() {
            private final Button downloadButton = new Button("Download");

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    ResourceTab resource = getTableView().getItems().get(getIndex());
                    downloadButton.getStyleClass().add("card-button");
                    downloadButton.setOnAction(event -> downloadResource(resource));
                    downloadButton.setDisable(resource.getFilePath() == null || resource.getFilePath().isEmpty());
                    setGraphic(downloadButton);
                }
            }
        });
    }

    private void downloadResource(ResourceTab resource) {
        if (resource.getFilePath() == null || resource.getFilePath().isEmpty()) {
            showAlert("Error", "No file available for download.");
            return;
        }
        
        try {
            File file = new File(resource.getFilePath());
            if (file.exists()) {
                Desktop.getDesktop().open(file);
            } else {
                showAlert("Error", "File not found: " + resource.getFilePath());
            }
        } catch (Exception e) {
            showAlert("Error", "Failed to open file: " + e.getMessage());
        }
    }

    private void showResourceDetails(ResourceTab resource) {
        Stage popup = new Stage();
        VBox vbox = new VBox(10);
        vbox.setPadding(new Insets(15));
        vbox.getStyleClass().add("popup-content");

        Label titleLabel = new Label(resource.getTitle());
        titleLabel.getStyleClass().add("popup-title");
        
        Label categoryLabel = new Label("Category: " + resource.getCategory());
        categoryLabel.getStyleClass().add("popup-subtitle");
        
        Label subjectLabel = new Label("Subject: " + resource.getSubject());
        subjectLabel.getStyleClass().add("popup-subtitle");
        
        Label typeLabel = new Label("Type: " + resource.getResourceType());
        typeLabel.getStyleClass().add("popup-subtitle");
        
        Label uploaderLabel = new Label("Uploaded by: " + resource.getUploaderName());
        uploaderLabel.getStyleClass().add("popup-subtitle");
        
        TextArea descriptionArea = new TextArea(resource.getDescription());
        descriptionArea.setEditable(false);
        descriptionArea.setWrapText(true);
        descriptionArea.setPrefHeight(100);
        descriptionArea.getStyleClass().add("form-input");
        
        Label timestampLabel = new Label("Uploaded on: " + resource.getCreatedAt());
        timestampLabel.getStyleClass().add("popup-timestamp");
        
        Label fileLabel = new Label("File: " + (resource.getFilePath() != null ? resource.getFilePath() : "No file"));
        fileLabel.getStyleClass().add("popup-timestamp");
        
        HBox buttonBox = new HBox(10);
        Button downloadButton = new Button("Download");
        downloadButton.getStyleClass().add("card-button");
        downloadButton.setOnAction(e -> {
            downloadResource(resource);
            popup.close();
        });
        downloadButton.setDisable(resource.getFilePath() == null || resource.getFilePath().isEmpty());
        
        Button closeButton = new Button("Close");
        closeButton.getStyleClass().add("card-button");
        closeButton.setOnAction(e -> popup.close());
        
        buttonBox.getChildren().addAll(downloadButton, closeButton);

        vbox.getChildren().addAll(titleLabel, categoryLabel, subjectLabel, typeLabel, 
                                 uploaderLabel, descriptionArea, timestampLabel, fileLabel, buttonBox);
        Scene scene = new Scene(vbox, 500, 400);
        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        popup.setScene(scene);
        popup.setTitle("Resource Details");
        popup.show();
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

    private void clearAddResourceFields() {
        addResourceTitleField.clear();
        addCategoryCombo.setValue("General");
        addSubjectCombo.setValue("General");
        addTypeCombo.setValue("PDF");
        addDescriptionArea.clear();
        addResourceFilePathField.clear();
    }

    private void clearUpdateResourceFields() {
        updateResourceTitleField.clear();
        updateCategoryCombo.setValue(null);
        updateSubjectCombo.setValue(null);
        updateTypeCombo.setValue(null);
        updateDescriptionArea.clear();
        updateResourceFilePathField.clear();
        updateResourceSection.setVisible(false);
        updateResourceSection.setManaged(false);
    }

    private void updateRoleBasedVisibility() {
        addResourceSection.setVisible(true);
        addResourceSection.setManaged(true);
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
}