<?php
header('Content-Type: application/json');
$dsn = 'mysql:host=localhost;dbname=sistema_facturacion;charset=utf8';
$username = 'root';
$password = '';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar si la solicitud es un POST
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';

        switch ($action) {
            case 'add':
                $nombre = $_POST['nombre'] ?? '';
                $email = $_POST['email'] ?? '';
                $telefono = $_POST['telefono'] ?? '';
                $contrasenia = $_POST['contrasenia'] ?? '';

                $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, telefono, password, sincronizado) VALUES (?, ?, ?, ?, 1)");
                $stmt->execute([$nombre, $email, $telefono, $contrasenia]);
                echo json_encode(['success' => true, 'message' => 'Usuario creado con éxito.']);
                break;

            case 'update':
                $id = $_POST['id'] ?? '';
                $nombre = $_POST['nombre'] ?? '';
                $email = $_POST['email'] ?? '';
                $telefono = $_POST['telefono'] ?? '';

                $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, sincronizado = 1 WHERE id = ?");
                $stmt->execute([$nombre, $email, $telefono, $id]);
                echo json_encode(['success' => true, 'message' => 'Usuario actualizado con éxito.']);
                break;

            case 'delete':
                $id = $_POST['id'] ?? '';
                $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Usuario eliminado con éxito.']);
                break;

                case 'fetch':
                    if (isset($_POST['id'])) {
                        $id = $_POST['id'];  // Obtener el ID del usuario
                        // Consulta para obtener el usuario junto con su permiso usando JOIN
                        $stmt = $pdo->prepare("
                            SELECT u.*, p.permiso 
                            FROM usuarios u
                            LEFT JOIN permisos_usuario p ON u.id = p.id_usuario
                            WHERE u.id = ?
                        ");
                        $stmt->execute([$id]);
                        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($usuario) {
                            echo json_encode($usuario); // Enviar el usuario específico con el permiso
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
                        }
                    } else {
                        // Si no se especifica un ID, obtenemos todos los usuarios con sus permisos
                        $stmt = $pdo->query("
                            SELECT u.*, p.permiso 
                            FROM usuarios u
                            LEFT JOIN permisos_usuario p ON u.id = p.id_usuario
                        ");
                        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        echo json_encode($usuarios); // Enviar todos los usuarios con sus permisos
                    }
                    break;
                

            default:
                echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
                break;
        }
    } else {
        // Si no es un POST, retornar error 405
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
?>
