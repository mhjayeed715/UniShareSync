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

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        System.out.println("HomepageController: Initializing...");
        announcementTitleCol.setCellValueFactory(new PropertyValueFactory<>("title"));
        announcementContentCol.setCellValueFactory(new PropertyValueFactory<>("contentSnippet"));
        announcementTimestampCol.setCellValueFactory(new PropertyValueFactory<>("createdAt"));
        setupViewDetailsColumn();
        loadAnnouncements();
        System.out.println("HomepageController: Initialized");
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
        ObservableList<AnnouncementTab> announcements = FXCollections.observableArrayList();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT title, content, created_at, image_path FROM announcements ORDER BY created_at DESC")) {
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String content = rs.getString("content");
                    String snippet = content.length() > 100 ? content.substring(0, 100) + "..." : content;
                    String createdAt = rs.getString("created_at") != null ? rs.getString("created_at") : "N/A";
                    String imagePath = rs.getString("image_path") != null ? rs.getString("image_path") : "";
                    announcements.add(new AnnouncementTab(rs.getString("title"), content, snippet, createdAt, imagePath));
                }
            }
            announcementsTable.setItems(announcements);
            System.out.println("HomepageController: Loaded " + announcements.size() + " announcements");
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

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                System.out.println("HomepageController: Updating viewDetailsCol cell, empty: " + empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    viewButton.setOnAction(event -> {
                        AnnouncementTab announcement = getTableView().getItems().get(getIndex());
                        showAnnouncementDetails(announcement);
                    });
                    setGraphic(viewButton);
                }
            }
        });
    }

    private void showAnnouncementDetails(AnnouncementTab announcement) {
        Stage popup = new Stage();
        VBox vbox = new VBox(10);
        vbox.setPadding(new Insets(10));
        vbox.getStyleClass().add("popup-content");

        Label titleLabel = new Label(announcement.getTitle());
        titleLabel.getStyleClass().add("popup-title");
        TextArea contentArea = new TextArea(announcement.getContent());
        contentArea.setEditable(false);
        contentArea.setWrapText(true);
        contentArea.setPrefHeight(200);
        Label timestampLabel = new Label("Posted on: " + announcement.getCreatedAt());
        timestampLabel.getStyleClass().add("popup-timestamp");
        ImageView imageView = new ImageView();
        if (announcement.getImagePath() != null && !announcement.getImagePath().isEmpty()) {
            try {
                imageView.setImage(new javafx.scene.image.Image(new File(announcement.getImagePath()).toURI().toString()));
                imageView.setFitWidth(200);
                imageView.setPreserveRatio(true);
            } catch (Exception e) {
                System.out.println("HomepageController: Failed to load image: " + e.getMessage());
            }
        }
        Button closeButton = new Button("Close");
        closeButton.setOnAction(e -> popup.close());

        vbox.getChildren().addAll(titleLabel, contentArea, timestampLabel, imageView, closeButton);
        Scene scene = new Scene(vbox, 400, 400);
        scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
        popup.setScene(scene);
        popup.setTitle("Announcement Details");
        popup.show();
    }

    private void navigateTo(String fxmlPath) {
        Stage stage = (Stage) loginButton.getScene().getWindow();
        if (stage.getScene() == null) {
            showAlert("Error", "Scene is not initialized");
            System.out.println("HomepageController: navigateTo - Scene is not initialized");
            return;
        }
        stage.getScene().getRoot().setOpacity(0);
        Platform.runLater(() -> {
            try {
                URL resource = getClass().getResource(fxmlPath);
                if (resource == null) {
                    throw new IllegalStateException("FXML resource not found: " + fxmlPath);
                }
                System.out.println("HomepageController: Loading FXML from: " + resource);
                FXMLLoader loader = new FXMLLoader(resource);
                AnchorPane root = loader.load();
                Object controller = loader.getController();
                if (controller instanceof Initializable) {
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
                }
                Scene scene = new Scene(root, 1000, 600);
                scene.getStylesheets().add(getClass().getResource("/unisharesync/css/styles.css").toExternalForm());
                stage.setScene(scene);
                stage.getScene().getRoot().setOpacity(1);
                System.out.println("HomepageController: Navigated to " + fxmlPath);
            } catch (Exception e) {
                showAlert("Error", "Failed to navigate: " + e.getMessage());
                System.out.println("HomepageController: navigateTo Exception - " + e.getMessage());
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

    public static class AnnouncementTab {
        private final StringProperty title = new SimpleStringProperty();
        private final StringProperty content = new SimpleStringProperty();
        private final StringProperty contentSnippet = new SimpleStringProperty();
        private final StringProperty createdAt = new SimpleStringProperty();
        private final StringProperty imagePath = new SimpleStringProperty();

        public AnnouncementTab(String title, String content, String contentSnippet, String createdAt, String imagePath) {
            this.title.set(title);
            this.content.set(content);
            this.contentSnippet.set(contentSnippet);
            this.createdAt.set(createdAt);
            this.imagePath.set(imagePath);
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