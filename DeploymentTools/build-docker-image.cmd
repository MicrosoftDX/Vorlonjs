@ECHO OFF

IF "%1"=="" GOTO :usage
IF "%2"=="" GOTO :usage
IF "%3"=="" GOTO :usage
IF "%4"=="" GOTO :usage
IF "%5"=="" GOTO :usage

@ECHO "SET DOCKER_HOST TO %1"
SET DOCKER_HOST=%1

@ECHO "BUILD DOCKER IMAGE"
<<<<<<< e8b74930c52175581277487b80f1b7f5ef039cd5
<<<<<<< 1ddaafe72dfdf26ab009d539b8def790548b149c
<<<<<<< 992816301884e11deb56b1f1704453798c451657
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" build -t jcorioland/vorlonjs:0.2.1
=======
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" build -t jcorioland/vorlonjs:0.2 .
>>>>>>> Fixing for 0.2
=======
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" build -t jcorioland/vorlonjs:0.2.1 .
>>>>>>> update docker image script
=======
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" build -t jcorioland/vorlonjs:0.2.1
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" tag jcorioland/vorlonjs:latest jcorioland/vorlonjs:0.2.1
>>>>>>> update docker image to add "latest" tag

@ECHO "LOG INTO DOCKER HUB"
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" login --username="%3" --password="%4" --email="%5" https://index.docker.io/v1/

@ECHO "PUSH IMAGE INTO DOCKER HUB"
<<<<<<< 1ddaafe72dfdf26ab009d539b8def790548b149c
<<<<<<< 992816301884e11deb56b1f1704453798c451657
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" push jcorioland/vorlonjs:0.2.1
=======
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" push jcorioland/vorlonjs:0.2
>>>>>>> Fixing for 0.2
=======
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" push jcorioland/vorlonjs:0.2.1
>>>>>>> update docker image script

@ECHO "LOG OUT FROM DOCKER HUB."
docker --tls --tlscacert="%2\ca.pem" --tlscert="%2\cert.pem" --tlskey="%2\key.pem" logout

GOTO :eof

:usage
@ECHO Usage: %0 ^<DOCKER_HOST^> ^<CERT_FOLDER^> ^<DOCKER_HUB_USERNAME^> ^<DOCKER_HUB_PASSWORD^>
EXIT /B 1
