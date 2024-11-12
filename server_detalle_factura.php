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
                $id_factura = $_POST['id_factura'] ?? '';
                $id_prodcuto = $_POST['id_prodcuto'] ?? '';
                $cantidad = $_POST['cantidad'] ?? '';
                $precio_unitario = $_POST['precio_unitario'] ?? '';
                $subtotal = $_POST['subtotal'] ?? '';

                $stmt = $pdo->prepare("INSERT INTO detalle_factura (id_factura, id_prodcuto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$id_factura, $id_prodcuto, $cantidad, $precio_unitario, $subtotal]);
                echo json_encode(['success' => true, 'message' => 'producto asignado con éxito.']);
                break;

            case 'update':
                $id_factura = $_POST['id_factura'] ?? '';
                $id_producto = $_POST['id_producto'] ?? '';
                $cantidad = $_POST['cantidad'] ?? '';
                $precio_unitario = $_POST['precio_unitario'] ?? '';
                $subtotal = $_POST['subtotal'] ?? '';

                $stmt = $pdo->prepare("UPDATE detalle_factura SET id_factura = ?, id_producto = ?, cantidad = ?, precio_unitario = ?, subtotal = ?, WHERE id_producto = ?");
                $stmt->execute([$id_factura, $id_producto, $cantidad, $precio_unitario, $id_producto, $subtotal]);
                echo json_encode(['success' => true, 'message' => 'producto actualizado con éxito.']);
                break;

            case 'delete':
                $id_producto = $_POST['id_producto'] ?? '';
                $stmt = $pdo->prepare("DELETE FROM detalle_fatura WHERE id_producto = ?");
                $stmt->execute([$id_producto]);
                echo json_encode(['success' => true, 'message' => 'producto eliminado con éxito.']);
                break;

            case 'fetch':
                if (isset($_POST['id_detalle'])) {
                    $id_detalle = $_POST['id_detalle'];  // Obtener el ID del usuario
                    $stmt = $pdo->prepare("SELECT * FROM detalle_factura WHERE id_detalle = ?");
                    $stmt->execute([$id_detalle]);
                    $detalle_factura = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($detalle_factura) {
                        echo json_encode($detalle_factura); // Enviar el usuario específico
                    } else {
                        echo json_encode(['success' => false, 'message' => 'producto no encontrado.']);
                    }
                } else {
                    $stmt = $pdo->query("SELECT * FROM detalle_factura");
                    $detalle_factura = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($detalle_factura); // Enviar todos los clientes si no hay ID
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
