package unisharesync;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class UniShareSync extends Application {
    
    @Override
    public void start(Stage stage) throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("ui/signup.fxml"));
        Scene scene = new Scene(loader.load(), 1000, 600); 
        scene.getStylesheets().add(getClass().getResource("css/styles.css").toExternalForm());
        stage.setTitle("UniShareSync");
        stage.setScene(scene);
        stage.setResizable(false);
        stage.show();
    }

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        launch(args);
    }
}