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
                $id_cliente = $_POST['id_cliente'] ?? '';
                $id_usuario = $_POST['id_usuario'] ?? '';
                $fecha = $_POST['fecha'] ?? '';

                $stmt = $pdo->prepare("INSERT INTO facturas (id_cliente, id_usuario, fecha) VALUES (?, ?, ?)");
                $stmt->execute([$id_cliente, $id_usuario, $fecha]);
                echo json_encode(['success' => true, 'message' => 'factura creada con éxito.']);
                break;

            case 'update':
                $id_factura = $_POST['id_factura'] ?? '';
                $id_cliente = $_POST['id_cliente'] ?? '';
                $id_usuario = $_POST['id_usuario'] ?? '';
                $fecha = $_POST['fecha'] ?? '';

                $stmt = $pdo->prepare("UPDATE facturas SET id_cliente = ?, id_usuario = ?, fecha = ? WHERE id_factura = ?");
                $stmt->execute([$id_cliente, $id_usuario, $fecha, $id_factura]);
                echo json_encode(['success' => true, 'message' => 'factura actualizada con éxito.']);
                break;

            case 'delete':
                $id_factura = $_POST['id_factura'] ?? '';
                $stmt = $pdo->prepare("DELETE FROM facturas WHERE id_factura = ?");
                $stmt->execute([$id_factura]);
                echo json_encode(['success' => true, 'message' => 'factura eliminada con éxito.']);
                break;

            case 'fetch':
                if (isset($_POST['id_factura'])) {
                    // Obtener el ID de la factura desde el POST
                    $id_factura = $_POST['id_factura'];

                    // Preparamos la consulta para obtener los detalles de la factura y las tablas relacionadas
                    $stmt = $pdo->prepare("
                            SELECT f.id_factura, f.fecha, f.total, 
                                   c.id_cliente, c.nombre AS cliente_nombre, 
                                   u.id, u.nombre AS usuario_nombre
                            FROM facturas f
                            LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
                            LEFT JOIN usuarios u ON f.id_usuario = u.id
                            WHERE f.id_factura = ?
                        ");

                    $stmt->execute([$id_factura]);
                    $factura = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($factura) {
                        echo json_encode($factura); // Enviar los detalles de la factura con los datos del cliente y usuario
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Factura no encontrada.']);
                    }
                } else {
                    // Si no se proporciona el id_factura, obtenemos todas las facturas
                    $stmt = $pdo->query("
                            SELECT f.id_factura, f.fecha, f.total, 
                                   c.id_cliente, c.nombre AS cliente_nombre, 
                                   u.id, u.nombre AS usuario_nombre
                            FROM facturas f
                            LEFT JOIN clientes c ON f.id_cliente = c.id_cliente
                            LEFT JOIN usuarios u ON f.id_usuario = u.id
                        ");

                    $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($facturas); // Enviar todas las facturas con los datos del cliente y usuario
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
