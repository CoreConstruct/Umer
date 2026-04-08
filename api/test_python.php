<?php
$output = shell_exec("python ../ml/model.py ../ml/x.jpg");
echo $output;
?>