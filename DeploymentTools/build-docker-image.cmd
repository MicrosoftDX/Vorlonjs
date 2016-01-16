@ECHO OFF

IF "%1"=="" GOTO :usage
IF "%2"=="" GOTO :usage
IF "%3"=="" GOTO :usage
IF "%4"=="" GOTO :usage

@ECHO "SET DOCKER_HOST TO %1"
SET DOCKER_HOST=%1

@ECHO "BUILD DOCKER IMAGE"
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" build -t jcorioland/vorlonjs:0.1 .

@ECHO "LOG INTO DOCKER HUB"
docker login --username="%3" --password="%4"

@ECHO "PUSH IMAGE INTO DOCKER HUB"
docker push jcorioland/vorlonjs:0.1

@ECHO "LOG OUT FROM DOCKER HUB"
docker logout

GOTO :eof

:usage
@ECHO Usage: %0 ^<DOCKER_HOST^> ^<CERT_FOLDER^> ^<DOCKER_HUB_USERNAME^> ^<DOCKER_HUB_PASSWORD^>
EXIT /B 1