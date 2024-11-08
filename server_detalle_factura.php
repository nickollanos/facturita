<?php
header('Content-Type: application/json');
$dsn = 'mysql:host=localhost;dbname=sistema_facturacion;charset=utf8';
$username = 'root';
$password = '';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';

        switch ($action) {
            case 'assign_permissions':
                // Obtener los datos del formulario
                $userId = $_POST['userId'] ?? '';
                $permiso = $_POST['permiso'] ?? '';

                if (!$userId || !$permiso) {
                    echo json_encode(['success' => false, 'message' => 'Faltan datos.']);
                    exit;
                }

                // Verificar si ya existen permisos para el usuario
                $stmt = $pdo->prepare("SELECT * FROM permisos_usuario WHERE id_usuario = ?");
                $stmt->execute([$userId]);
                $permisoExistente = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($permisoExistente) {
                    // Si ya existe, hacer UPDATE
                    $stmt = $pdo->prepare("UPDATE permisos_usuario SET permiso = ? WHERE id_usuario = ?");
                    $stmt->execute([$permiso, $userId]);
                    echo json_encode(['success' => true, 'message' => 'Permisos actualizados correctamente.']);
                } else {
                    // Si no existe, hacer INSERT
                    $stmt = $pdo->prepare("INSERT INTO permisos_usuario (id_usuario, permiso) VALUES (?, ?)");
                    $stmt->execute([$userId, $permiso]);
                    echo json_encode(['success' => true, 'message' => 'Permisos asignados correctamente.']);
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
