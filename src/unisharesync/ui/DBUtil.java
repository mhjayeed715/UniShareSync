package unisharesync.ui;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import org.mindrot.jbcrypt.BCrypt;

public class DBUtil {
    private static final String URL = "jdbc:mysql://localhost:3306/unisharesync_db";
    private static final String USER = "root";
    private static final String PASSWORD = "password123"; 

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.out.println("MySQL JDBC Driver not found: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void closeConnection(Connection conn) {
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }

    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public static boolean checkPassword(String password, String hashed) {
        return BCrypt.checkpw(password, hashed);
    }
}