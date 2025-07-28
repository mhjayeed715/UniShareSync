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
import javafx.scene.layout.VBox;
import javafx.geometry.Insets;
import javafx.stage.Stage;
import javafx.stage.Modality;

public class HomepageController implements Initializable {

    @FXML private Button loginButton;
    @FXML private Button signupButton;
    @FXML private Button ctaButton;
    @FXML private TableView<AnnouncementTab> announcementsTable;
    @FXML private TableColumn<AnnouncementTab, String> announcementTitleCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementContentCol;
    @FXML private TableColumn<AnnouncementTab, String> announcementTimestampCol;
    @FXML private TableColumn<AnnouncementTab, Void> viewDetailsCol;

    private String currentEmail;
    private ObservableList<AnnouncementTab> announcementsList;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("HomepageController: Initializing...");
        
        // Initialize the list first
        announcementsList = FXCollections.observableArrayList();
        
        // Set up table columns
        announcementTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        announcementContentCol.setCellValueFactory(new PropertyValueFactory<>("contentSnippet"));
        announcementTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
        
        // Set the items to the table
        announcementsTable.setItems(announcementsList);
        
        // Setup the view details column
        setupViewDetailsColumn();
        
        // Load announcements
        loadAnnouncements();
        
        System.out.println("HomepageController: Initialized with " + announcementsList.size() + " announcements");
    }

    public void setCurrentEmail(String email) {
        this.currentEmail = email != null ? email.trim().toLowerCase() : null;
        System.out.println("HomepageController: Current email set to: " + currentEmail);
    }

    @FXML
    private void goToLogin(ActionEvent event) {
        System.out.println("HomepageController: Navigate to login.fxml");
        navigateTo("/unisharesync/ui/login.fxml");
    }

    @FXML
    private void goToSignup(ActionEvent event) {
        System.out.println("HomepageController: Navigate to signup.fxml");
        navigateTo("/unisharesync/ui/signup.fxml");
    }

    private void loadAnnouncements() {
        System.out.println("HomepageController: Loading announcements...");
        
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT title, content, created_at, image_path FROM announcements ORDER BY created_at DESC")) {
            
            // Clear existing data
            announcementsList.clear();
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String title = rs.getString("title");
                    String content = rs.getString("content");
                    String snippet = content != null && content.length() > 100 ? 
                        content.substring(0, 100) + "..." : content;
                    String createdAt = rs.getString("created_at") != null ? 
                        rs.getString("created_at") : "N/A";
                    String imagePath = rs.getString("image_path") != null ? 
                        rs.getString("image_path") : "";
                    
                    AnnouncementTab announcement = new AnnouncementTab(title, content, snippet, createdAt, imagePath);
                    announcementsList.add(announcement);
                    System.out.println("HomepageController: Added announcement: " + title);
                }
            }
            
            System.out.println("HomepageController: Successfully loaded " + announcementsList.size() + " announcements");
            
        } catch (SQLException e) {
            e.printStackTrace();
            showAlert("Error", "Failed to load announcements: " + e.getMessage());
            System.out.println("HomepageController: loadAnnouncements SQLException - " + e.getMessage());
        }
    }

    private void setupViewDetailsColumn() {
        System.out.println("HomepageController: Setting up viewDetailsCol");
        
        viewDetailsCol.setCellFactory(param -> new TableCell<AnnouncementTab, Void>() {
            private final Button viewButton = new Button("View");
            private AnnouncementTab currentAnnouncement;
            
            {
                viewButton.setStyle("-fx-background-color: linear-gradient(to right, #1E88E5, #26A69A); " +
                                  "-fx-text-fill: white; " +
                                  "-fx-font-size: 12px; " +
                                  "-fx-padding: 5 10; " +
                                  "-fx-background-radius: 4;");
                
                viewButton.setOnAction(event -> {
                    if (currentAnnouncement != null) {
                        System.out.println("HomepageController: Viewing announcement: " + currentAnnouncement.getTitle());
                        showAnnouncementDetails(currentAnnouncement);
                    } else {
                        System.out.println("HomepageController: No announcement to view");
                    }
                });
            }

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                
                if (empty || getTableRow() == null) {
                    setGraphic(null);
                    currentAnnouncement = null;
                } else {
                    // Get the announcement from the table row
                    currentAnnouncement = (AnnouncementTab) getTableRow().getItem();
                    if (currentAnnouncement != null) {
                        setGraphic(viewButton);
                    } else {
                        setGraphic(null);
                    }
                }
            }
        });
    }

    private void showAnnouncementDetails(AnnouncementTab announcement) {
        try {
            System.out.println("HomepageController: Showing details for: " + announcement.getTitle());
            
            Stage popup = new Stage();
            popup.initModality(Modality.APPLICATION_MODAL);
            popup.initOwner(announcementsTable.getScene().getWindow());
            
            VBox vbox = new VBox(15);
            vbox.setPadding(new Insets(20));
            vbox.setStyle("-fx-background-color: white; " +
                         "-fx-background-radius: 10; " +
                         "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 10, 0, 0, 5);");

            Label titleLabel = new Label(announcement.getTitle());
            titleLabel.setStyle("-fx-font-size: 18px; " +
                              "-fx-font-weight: bold; " +
                              "-fx-text-fill: #1a202c;");
            titleLabel.setWrapText(true);
            
            ScrollPane scrollPane = new ScrollPane();
            TextArea contentArea = new TextArea(announcement.getContent());
            contentArea.setEditable(false);
            contentArea.setWrapText(true);
            contentArea.setPrefHeight(200);
            contentArea.setStyle("-fx-background-color: #f8fafc; " +
                               "-fx-border-color: #e2e8f0; " +
                               "-fx-border-radius: 5;");
            scrollPane.setContent(contentArea);
            scrollPane.setFitToWidth(true);
            scrollPane.setPrefHeight(220);
            
            Label timestampLabel = new Label("Posted on: " + announcement.getCreatedAt());
            timestampLabel.setStyle("-fx-font-size: 12px; " +
                                  "-fx-text-fill: #64748b;");
            
            ImageView imageView = new ImageView();
            if (announcement.getImagePath() != null && !announcement.getImagePath().isEmpty()) {
                try {
                    File imageFile = new File(announcement.getImagePath());
                    if (imageFile.exists()) {
                        imageView.setImage(new javafx.scene.image.Image(imageFile.toURI().toString()));
                        imageView.setFitWidth(300);
                        imageView.setPreserveRatio(true);
                        imageView.setSmooth(true);
                    }
                } catch (Exception e) {
                    System.out.println("HomepageController: Failed to load image: " + e.getMessage());
                }
            }
            
            Button closeButton = new Button("Close");
            closeButton.setStyle("-fx-background-color: linear-gradient(to right, #1E88E5, #26A69A); " +
                                "-fx-text-fill: white; " +
                                "-fx-padding: 10 20; " +
                                "-fx-background-radius: 5;");
            closeButton.setOnAction(e -> {
                System.out.println("HomepageController: Closing popup");
                popup.close();
            });

            vbox.getChildren().addAll(titleLabel, scrollPane, timestampLabel);
            if (imageView.getImage() != null) {
                vbox.getChildren().add(imageView);
            }
            vbox.getChildren().add(closeButton);
            
            Scene scene = new Scene(vbox, 450, 500);
            popup.setScene(scene);
            popup.setTitle("Announcement Details");
            popup.setResizable(false);
            popup.show();
            
            System.out.println("HomepageController: Popup shown successfully");
            
        } catch (Exception e) {
            System.out.println("HomepageController: Error showing announcement details: " + e.getMessage());
            e.printStackTrace();
            showAlert("Error", "Failed to show announcement details: " + e.getMessage());
        }
    }

    private void navigateTo(String fxmlPath) {
        try {
            Stage stage = (Stage) loginButton.getScene().getWindow();
            if (stage.getScene() == null) {
                showAlert("Error", "Scene is not initialized");
                return;
            }
            
            Platform.runLater(() -> {
                try {
                    URL resource = getClass().getResource(fxmlPath);
                    if (resource == null) {
                        throw new IllegalStateException("FXML resource not found: " + fxmlPath);
                    }
                    
                    FXMLLoader loader = new FXMLLoader(resource);
                    AnchorPane root = loader.load();
                    Object controller = loader.getController();
                    
                    if (controller instanceof HomepageController) {
                        ((HomepageController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AnnouncementController) {
                        ((AnnouncementController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ProfileController) {
                        ((ProfileController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ProjectController) {
                        ((ProjectController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof ResourceController) {
                        ((ResourceController) controller).setCurrentEmail(currentEmail);
                    } else if (controller instanceof AdminDashboardController) {
                        ((AdminDashboardController) controller).setCurrentEmail(currentEmail);
                    }
                    
                    Scene scene = new Scene(root, 1000, 600);
                    try {
                        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                    } catch (Exception cssError) {
                        System.out.println("HomepageController: CSS loading failed, using inline styles");
                    }
                    
                    stage.setScene(scene);
                    System.out.println("HomepageController: Navigated to " + fxmlPath);
                    
                } catch (Exception e) {
                    showAlert("Error", "Failed to navigate: " + e.getMessage());
                    e.printStackTrace();
                }
            });
        } catch (Exception e) {
            showAlert("Error", "Navigation error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void showAlert(String title, String message) {
        Platform.runLater(() -> {
            try {
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle(title);
                alert.setHeaderText(null);
                alert.setContentText(message);
                alert.showAndWait();
            } catch (Exception e) {
                System.out.println("HomepageController: Error showing alert: " + e.getMessage());
            }
        });
    }

    public static class AnnouncementTab {
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty content = new SimpleStringProperty();
        private final StringProperty contentSnippet = new SimpleStringProperty();
        private final StringProperty createdAt = new SimpleStringProperty();
        private final StringProperty imagePath = new SimpleStringProperty();

        public AnnouncementTab(String title, String content, String contentSnippet, String createdAt, String imagePath) {
            this.title.set(title != null ? title : "");
            this.content.set(content != null ? content : "");
            this.contentSnippet.set(contentSnippet != null ? contentSnippet : "");
            this.createdAt.set(createdAt != null ? createdAt : "");
            this.imagePath.set(imagePath != null ? imagePath : "");
        }

        public String getTitle() { return title.get(); }
        public String getContent() { return content.get(); }
        public String getContentSnippet() { return contentSnippet.get(); }
        public String getCreatedAt() { return createdAt.get(); }
        public String getImagePath() { return imagePath.get(); }

        public StringProperty titleProperty() { return title; }
        public StringProperty contentProperty() { return content; }
        public StringProperty contentSnippetProperty() { return contentSnippet; }
        public StringProperty createdAtProperty() { return createdAt; }
        public StringProperty imagePathProperty() { return imagePath; }
    }
}