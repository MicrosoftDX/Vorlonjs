@ECHO OFF

IF "%1"=="" GOTO :usage
IF "%2"=="" GOTO :usage
IF "%3"=="" GOTO :usage
IF "%4"=="" GOTO :usage
IF "%5"=="" GOTO :usage

@ECHO "SET DOCKER_HOST TO %1"
SET DOCKER_HOST=%1

@ECHO "BUILD DOCKER IMAGE"
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" build -t jcorioland/vorlonjs:0.2.1

@ECHO "LOG INTO DOCKER HUB"
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" login --username="%3" --password="%4" --email="%5" https://index.docker.io/v1/

@ECHO "PUSH IMAGE INTO DOCKER HUB"
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" push jcorioland/vorlonjs:0.2.1

@ECHO "LOG OUT FROM DOCKER HUB."
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" logout

GOTO :eof

:usage
@ECHO Usage: %0 ^<DOCKER_HOST^> ^<CERT_FOLDER^> ^<DOCKER_HUB_USERNAME^> ^<DOCKER_HUB_PASSWORD^>
EXIT /B 1