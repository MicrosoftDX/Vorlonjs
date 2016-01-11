@ECHO OFF

IF "%1"=="" GOTO :usage
IF "%2"=="" GOTO :usage

@ECHO "SET DOCKER_HOST TO %1"
SET DOCKER_HOST=%1

docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" build -t jcorioland/vorlonjs:0.1 .

GOTO :eof

:usage
@ECHO Usage: %0 ^<DOCKER_HOST^> ^<CERT_FOLDER^>
EXIT /B 1