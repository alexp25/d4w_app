@ECHO OFF
CD ..

START  robocopy frontend\dist\css backend\dist\css /s /e
START  robocopy frontend\dist\js backend\dist\js /s /e
START  robocopy frontend\dist\templates backend\dist\templates /s /e

pause
EXIT /B 0
