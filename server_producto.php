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
                $descripcion = $_POST['descripcion'] ?? '';
                $precio = $_POST['precio'] ?? '';
                $stock = $_POST['stock'] ?? '';

                $stmt = $pdo->prepare("INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)");
                $stmt->execute([$nombre, $descripcion, $precio, $stock]);
                echo json_encode(['success' => true, 'message' => 'producto creado con éxito.']);
                break;

            case 'update':
                $id_producto = $_POST['id_producto'] ?? '';
                $nombre = $_POST['nombre'] ?? '';
                $descripcion = $_POST['descripcion'] ?? '';
                $precio = $_POST['precio'] ?? '';
                $stock = $_POST['stock'] ?? '';

                $stmt = $pdo->prepare("UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id_producto = ?");
                $stmt->execute([$nombre, $descripcion, $precio, $stock, $id_producto]);
                echo json_encode(['success' => true, 'message' => 'producto actualizado con éxito.']);
                break;

            case 'delete':
                $id_producto = $_POST['id_producto'] ?? '';
                $stmt = $pdo->prepare("DELETE FROM productos WHERE id_producto = ?");
                $stmt->execute([$id_producto]);
                echo json_encode(['success' => true, 'message' => 'producto eliminado con éxito.']);
                break;

            case 'fetch':
                if (isset($_POST['id_producto'])) {
                    $id_producto = $_POST['id_producto'];  // Obtener el ID del usuario
                    $stmt = $pdo->prepare("SELECT * FROM productos WHERE id_producto = ?");
                    $stmt->execute([$id_producto]);
                    $producto = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($producto) {
                        echo json_encode($producto); // Enviar el usuario específico
                    } else {
                        echo json_encode(['success' => false, 'message' => 'producto no encontrado.']);
                    }
                } else {
                    $stmt = $pdo->query("SELECT * FROM productos");
                    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($productos); // Enviar todos los productos si no hay ID
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
