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
                $direccion = $_POST['direccion'] ?? '';

                $stmt = $pdo->prepare("INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)");
                $stmt->execute([$nombre, $email, $telefono, $direccion]);
                echo json_encode(['success' => true, 'message' => 'Cliente creado con éxito.']);
                break;

            case 'update':
                $id_cliente = $_POST['id_cliente'] ?? '';
                $nombre = $_POST['nombre'] ?? '';
                $email = $_POST['email'] ?? '';
                $telefono = $_POST['telefono'] ?? '';
                $direccion = $_POST['direccion'] ?? '';

                $stmt = $pdo->prepare("UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id_cliente = ?");
                $stmt->execute([$nombre, $email, $telefono, $direccion, $id_cliente]);
                echo json_encode(['success' => true, 'message' => 'Cliente actualizado con éxito.']);
                break;

            case 'delete':
                $id_cliente = $_POST['id_cliente'] ?? '';
                $stmt = $pdo->prepare("DELETE FROM clientes WHERE id_cliente = ?");
                $stmt->execute([$id_cliente]);
                echo json_encode(['success' => true, 'message' => 'Cliente eliminado con éxito.']);
                break;

            case 'fetch':
                if (isset($_POST['id_cliente'])) {
                    $id_cliente = $_POST['id_cliente'];  // Obtener el ID del usuario
                    $stmt = $pdo->prepare("SELECT * FROM clientes WHERE id_cliente = ?");
                    $stmt->execute([$id_cliente]);
                    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($cliente) {
                        echo json_encode($cliente); // Enviar el usuario específico
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Cliente no encontrado.']);
                    }
                } else {
                    $stmt = $pdo->query("SELECT * FROM clientes");
                    $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($clientes); // Enviar todos los clientes si no hay ID
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
