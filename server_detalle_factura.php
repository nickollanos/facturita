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
                $id_producto = $_POST['id_producto'] ?? '';
                $cantidad = $_POST['cantidad'] ?? '';
                $precio_unitario = $_POST['precio_unitario'] ?? '';
                $subtotal = $_POST['subtotal'] ?? '';

                // Verificar si el producto ya está asignado a esta factura
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM detalle_factura WHERE id_factura = ? AND id_producto = ?");
                $stmt->execute([$id_factura, $id_producto]);
                $producto_existente = $stmt->fetchColumn();

                // Si el producto ya está en la factura, no permitir agregarlo
                if ($producto_existente > 0) {
                    echo json_encode(['success' => false, 'message' => 'Este producto ya está asignado a esta factura. Solo puede ser actualizado.']);
                    exit;
                }

                // Insertar el detalle en la tabla detalle_factura
                $stmt = $pdo->prepare("INSERT INTO detalle_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$id_factura, $id_producto, $cantidad, $precio_unitario, $subtotal]);

                // Sumar todos los subtotales de la factura para calcular el total
                $stmt = $pdo->prepare("SELECT SUM(subtotal) FROM detalle_factura WHERE id_factura = ?");
                $stmt->execute([$id_factura]);
                $total_factura = $stmt->fetchColumn();

                // Actualizar el total de la factura en la tabla facturas
                $stmt = $pdo->prepare("UPDATE facturas SET total = ? WHERE id_factura = ?");
                $stmt->execute([$total_factura, $id_factura]);

                echo json_encode(['success' => true, 'message' => 'Producto asignado con éxito y total actualizado.']);
                break;

            case 'update':
                $id_detalle = $_POST['id_detalle'] ?? '';
                $id_factura = $_POST['id_factura'] ?? '';
                $id_producto = $_POST['id_producto'] ?? '';
                $cantidad = $_POST['cantidad'] ?? '';
                $precio_unitario = $_POST['precio_unitario'] ?? '';
                $subtotal = $_POST['subtotal'] ?? '';

                // Actualizar el detalle de la factura
                $stmt = $pdo->prepare("UPDATE detalle_factura SET id_factura = ?, id_producto = ?, cantidad = ?, precio_unitario = ?, subtotal = ? WHERE id_detalle = ?");
                $stmt->execute([$id_factura, $id_producto, $cantidad, $precio_unitario, $subtotal, $id_detalle]);

                // Sumar todos los subtotales de la factura para calcular el total
                $stmt = $pdo->prepare("SELECT SUM(subtotal) FROM detalle_factura WHERE id_factura = ?");
                $stmt->execute([$id_factura]);
                $total_factura = $stmt->fetchColumn();

                // Actualizar el total de la factura en la tabla facturas
                $stmt = $pdo->prepare("UPDATE facturas SET total = ? WHERE id_factura = ?");
                $stmt->execute([$total_factura, $id_factura]);

                // Verificar si se actualizó algún registro
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Producto actualizado con éxito y total actualizado.'
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'No se encontró el detalle de la factura para actualizar.'
                    ]);
                }
                break;


            case 'delete':
                $id_detalle = $_POST['id_detalle'] ?? '';
                $id_factura = $_POST['id_factura'] ?? '';

                if (!$id_detalle || !$id_factura) {
                    echo json_encode(['success' => false, 'message' => 'Faltan datos para eliminar el detalle de la factura.']);
                } else {
                    // Obtener el subtotal del detalle antes de eliminarlo
                    $stmt = $pdo->prepare("SELECT subtotal FROM detalle_factura WHERE id_detalle = ?");
                    $stmt->execute([$id_detalle]);
                    $subtotal = $stmt->fetchColumn();

                    if ($subtotal === false) {
                        echo json_encode(['success' => false, 'message' => 'No se encontró el detalle de la factura para eliminar.']);
                        exit;
                    }

                    // Eliminar el detalle de la factura
                    $stmt = $pdo->prepare("DELETE FROM detalle_factura WHERE id_detalle = ?");
                    $stmt->execute([$id_detalle]);

                    // Obtener el total actual de la factura
                    $stmt = $pdo->prepare("SELECT total FROM facturas WHERE id_factura = ?");
                    $stmt->execute([$id_factura]);
                    $total_factura = $stmt->fetchColumn();

                    // Restar el subtotal eliminado del total actual
                    $nuevo_total = $total_factura - $subtotal;

                    // Actualizar el total en la tabla facturas
                    $stmt = $pdo->prepare("UPDATE facturas SET total = ? WHERE id_factura = ?");
                    $stmt->execute([$nuevo_total, $id_factura]);

                    echo json_encode(['success' => true, 'message' => 'Producto eliminado con éxito y total actualizado.']);
                }
                break;


            case 'fetch':
                if (isset($_POST['id_detalle'])) {
                    $id_detalle = $_POST['id_detalle'];  // Obtener el ID del detalle de la factura

                    // Consulta con JOIN para obtener el detalle de la factura y el nombre del producto
                    $stmt = $pdo->prepare("
                        SELECT 
                            detalle_factura.*, 
                            productos.nombre
                        FROM 
                            detalle_factura
                        JOIN 
                            productos ON detalle_factura.id_producto = productos.id_producto
                        WHERE 
                            detalle_factura.id_detalle = ?
                    ");
                    $stmt->execute([$id_detalle]);
                    $detalle_factura = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($detalle_factura) {
                        echo json_encode($detalle_factura); // Enviar el detalle de la factura con el nombre del producto
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Detalle de factura no encontrado.']);
                    }
                } else {
                    // Consulta con JOIN para obtener todos los detalles de las facturas y sus productos
                    $stmt = $pdo->query("
                        SELECT 
                            detalle_factura.*, 
                            productos.nombre
                        FROM 
                            detalle_factura
                        JOIN 
                            productos ON detalle_factura.id_producto = productos.id_producto
                    ");
                    $detalle_factura = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($detalle_factura); // Enviar todos los detalles de las facturas con los nombres de los productos
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
