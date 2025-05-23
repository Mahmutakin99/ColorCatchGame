<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $score = isset($_POST['score']) ? (int) $_POST['score'] : 0;

    $file = 'highscore.txt';

    $currentHigh = 0;
    if (file_exists($file)) {
        $currentHigh = (int) file_get_contents($file);
    }

    if ($score > $currentHigh) {
        file_put_contents($file, $score);
        echo json_encode(["success" => true, "newHigh" => $score]);
    } else {
        echo json_encode(["success" => true, "newHigh" => $currentHigh]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
}
?>
