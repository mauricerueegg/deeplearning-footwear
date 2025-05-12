# 🌸 Flower Classification – ML Deployment mit Spring Boot

Dieses Projekt implementiert ein vollständiges Machine Learning System zur Klassifikation von Blumenarten. Es umfasst die Trainingslogik, Modellinferenz sowie eine REST-API mit Spring Boot und kann containerisiert über Docker betrieben und über Azure als Web-App deployed werden.

## 🔍 Features

- Klassifikation von Blumenarten basierend auf ML-Modellen  
- REST-API für Inferenz und Modelltraining  
- Verwaltung verschiedener Modelle (z. B. Decision Tree, SVM)  
- Docker-kompatibel 
- Azure-kompatibel 
- Java Spring Boot Backend  


## Data import

Die Daten für die Bild-Erkennung wurden von Kaggle heruntergeladen. Es wurden zu 14 Blumenarten je 1000 Bilder fürs Training verwendet

Kaggle Link: https://www.kaggle.com/datasets/marquis03/flower-classification

![alt text](image.png)

## Model Training

Diese Klasse enthält die main-Methode und definiert den kompletten Trainingsprozess.

![alt text](<Bildschirmfoto 2025-05-12 um 11.46.41-1.png>)

Wichtige Punkte:
	•	Trainingsparameter:
	•	BATCH_SIZE = 4: Anzahl Bilder pro Trainingsschritt.
	•	EPOCHS = 10: Anzahl der Durchläufe durch den gesamten Datensatz.
	•	Ablauf des Trainings:
	1.	Lade Trainingsdaten aus einem Verzeichnis (./archive/train) als ImageFolder-Dataset.
	2.	Aufteilung in Trainings- (80 %) und Validierungsdaten (20 %) mit randomSplit.
	3.	Verlustfunktion: softmaxCrossEntropyLoss, typisch für Klassifikation.
	4.	Trainingskonfiguration: beinhaltet die Verlustfunktion.
	5.	Modell & Trainer: Initialisierung und Setzen der Metriken.
	6.	Trainieren: mit EasyTrain.fit().
	7.	Speichern der Ergebnisse: Das Modell wird mit Accuracy und Loss annotiert.




Dieser Code definiert eine Hilfsklasse Models, die für die Erstellung und Verwaltung eines neuronalen Netzwerks zuständig ist:

![alt text](<Bildschirmfoto 2025-05-12 um 11.46.27-1.png>) 

Wichtige Punkte:
	•	Konstanten:
	•	NUM_OF_OUTPUT = 14: Das Modell soll 14 Klassen unterscheiden.
	•	IMAGE_HEIGHT und IMAGE_WIDTH = 100: Bilder werden auf 100x100 Pixel skaliert.
	•	MODEL_NAME = "flowerclassifier": Name des Modells.
	•	getModel()-Methode:
	•	Erstellt ein neues Modellobjekt.
	•	Baut ein ResNet50-Netzwerk mit:
	•	Eingabedimensionen 3x100x100 (RGB-Bild).
	•	50 Schichten.
	•	14 Ausgabeklassen.
	•	Das Netzwerk wird mit setBlock(resNet50) dem Modell zugewiesen.
	•	saveSynset()-Methode:
	•	Schreibt eine Liste von Klassennamen (synset) in eine Datei namens synset.txt.
	•	Wird später benötigt, um Vorhersagen den richtigen Klassen zuzuordnen.





Das Model-Training dauert ca. 2 Stunden. Dann erreicht das Modell eine Accuracy von 95% out of sample, was ein sehr gutes Resultat ist.

![alt text](<Bildschirmfoto 2025-05-12 um 13.22.39.png>)


## SpringBoot App

Diese Klasse ist zuständig für das Laden des trainierten Modells und das Durchführen von Vorhersagen auf neue Bilder.

![alt text](<Bildschirmfoto 2025-05-12 um 11.51.57.png>)

- Feld predictor: Ein Predictor, der Bilder in Klassifikationen umwandelt.
- Konstruktor:
- Lädt das trainierte Modell aus dem Ordner models.
- Definiert einen Translator:
- Verkleinert das Bild auf die erwartete Grösse (Resize).
- Wandelt das Bild in ein Tensor-Format (ToTensor).
- Wendet optional Softmax auf die Ausgabe an (für Wahrscheinlichkeiten).
- Erstellt den Predictor aus Modell + Übersetzer.
- predict(byte[] image)-Methode:
- Konvertiert ein byte[] in ein BufferedImage.
- Wandelt es dann in ein DJL-Image um.
- Führt die Vorhersage durch und gibt das Ergebnis zurück (Classifications).



Diese Klasse startet die gesamte Spring Boot-Anwendung.

![alt text](<Bildschirmfoto 2025-05-12 um 11.52.10.png>)

- Annotation @SpringBootApplication: Markiert die Hauptklasse für Spring Boot.
- ()-Methode: Startet die Applikation über SpringApplication.run(...).

Die Anwendung wird durch Ausführen dieser Klasse als Webserver hochgefahren und stellt REST-Endpunkte bereit.



Dieser Controller stellt zwei HTTP-Endpunkte zur Verfügung.

![alt text](<Bildschirmfoto 2025-05-12 um 11.52.04.png>)

Endpunkte:
- GET /ping
- Gibt einen einfachen Text zurück: „Classification app is up and running!“
- Wird z. B. von Monitoring-Tools verwendet, um zu prüfen, ob der Server läuft.
- POST /analyze
- Erwartet eine Bilddatei im MultipartFile-Format.
- Übergibt das Bild an die Inference-Instanz und ruft die predict()-Methode auf.
- Gibt das Klassifikationsergebnis als JSON zurück (toJson()).


## Dockerfile

Um zu testen, ob die App funktioniert, wurde es mit Docker veröffentlicht.

![alt text](image-1.png)

Das Dockerfile dient zur Containerisierung einer Spring Boot Anwendung, die ein trainiertes Deep-Learning-Modell zur Bildklassifikation nutzt. Als Basis wird ein schlankes Image mit OpenJDK 17 verwendet (eclipse-temurin:17-jdk-alpine), da es ressourcenschonend ist und sich gut für den produktiven Einsatz eignet. Im Container wird zunächst das Arbeitsverzeichnis auf /app gesetzt. Anschliessend wird die erzeugte ausführbare JAR-Datei der Anwendung (flower-classification-app.jar) aus dem lokalen target-Verzeichnis in den Container kopiert. Um die Anwendung später über das Netzwerk erreichbar zu machen, wird der Port 8080 freigegeben – das ist der Standardport für Spring Boot-Anwendungen.

Der Start der Anwendung im Container erfolgt über den Java-Befehl java -jar app.jar, der in der ENTRYPOINT-Anweisung definiert ist. Dadurch wird beim Starten des Containers automatisch die Anwendung ausgeführt.

Nach dem Erstellen des Containers mit docker build und dem Ausführen mit docker run kann die Anwendung lokal im Browser oder per REST-Client über http://localhost:8080 aufgerufen werden. Beispielsweise liefert der Endpunkt /ping eine Statusmeldung, während der Endpunkt /analyze Bilder entgegennimmt und eine Klassifikation zurückgibt. Dieses Setup stellt sicher, dass das Modell und die Anwendung in jeder Umgebung konsistent und unabhängig von lokalen Systemkonfigurationen betrieben werden können.


## Azure Deployment

![alt text](<Bildschirmfoto 2025-05-05 um 20.37.14.png>)

Zunächst wurde das Docker-Image lokal gebaut und getestet. Dabei wurde es mit dem Befehl docker run -p 9000:8080 -d mauricerueegg/djl-flower-classification gestartet, wobei der Container-Port 8080 auf Port 9000 des Hosts gemappt wurde. Nach erfolgreichem Test wurde das Image unter dem Tag latest in die Docker Registry auf Docker Hub gepusht (docker push mauricerueegg/djl-flower-classification). Dies ist auf dem ersten Screenshot ersichtlich, wo mehrere Layer erfolgreich hochgeladen wurden.

 ![alt text](<Bildschirmfoto 2025-05-05 um 20.37.32.png>) 

Im nächsten Schritt wurde auf Azure über die CLI eine neue Ressourcengruppe namens djl-flower-classification in der Region switzerlandnorth erstellt. Dies wird im zweiten Screenshot bestätigt, der die Rückmeldung „provisioningState: Succeeded“ zeigt.

![alt text](<Bildschirmfoto 2025-05-05 um 20.37.48.png>)

Anschliessend wurde ein App Service Plan erstellt, ebenfalls mit dem Namen djl-flower-classification, basierend auf einem Linux-Container und im kostenlosen Tarif F1. Screenshot drei zeigt die vollständige Konfiguration dieses Plans, inklusive Standort, Art (Linux), Anzahl der Worker (1) und dem erfolgreichen Bereitstellungsstatus.

![alt text](<Bildschirmfoto 2025-05-05 um 20.38.03.png>) 

Daraufhin wurde mit az webapp create eine neue Web-App erzeugt, die auf dem Docker-Image basiert. In der Befehlszeile wurde das Image mauricerueegg/djl-flower-classification:latest als Container angegeben, der aus Docker Hub geladen wird. Der vierte Screenshot zeigt die automatisch generierte Azure-Domain (djl-flower-classification.azurewebsites.net), unter der die Anwendung öffentlich erreichbar ist.

![alt text](<Bildschirmfoto 2025-05-05 um 20.42.33.png>) 

Nach dem Deployment konnte in der Azure Web-Konsole (Screenshot fünf) über den Protokollstream nachvollzogen werden, dass der Container erfolgreich gestartet wurde. Die Konsole zeigt dabei das bekannte KuduLite-ASCII-Logo sowie die Debug-Logs der App.

![alt text](<Bildschirmfoto 2025-05-05 um 20.42.57.png>) 

Schliesslich ist im letzten Screenshot die vollständige Übersicht der Web-App innerhalb des Azure-Portals dargestellt. Dort ist ersichtlich, dass das Betriebssystem „Linux“, das Veröffentlichungsmodell „Container“ und die Quelle des Container-Images korrekt erkannt wurden. Die Anwendung wurde im Rahmen des Azure for Students-Abonnements bereitgestellt und läuft stabil in der kostenlosen Tier-Konfiguration.

Insgesamt zeigt dieser Ablauf, wie ein mit DJL entwickeltes Java-Modell für Bildklassifikation erfolgreich in einen Docker-Container verpackt und auf Azure App Services bereitgestellt werden kann – inklusive automatischer Skalierung, Webzugang und Logging-Funktionalität.


## UI und Test der App

![alt text](<Bildschirmfoto 2025-05-12 um 13.16.08.png>)

Die Webanwendung „Flower Classification“ ermöglicht es Nutzerinnen und Nutzern, ein Bild einer Blume im JPEG- oder PNG-Format hochzuladen, um automatisch die Art der Blume zu bestimmen. Die Oberfläche ist bewusst einfach und intuitiv gestaltet: Im Zentrum steht ein Upload-Feld, über das sich ein Bild von einem lokalen Gerät auswählen lässt. Ziel ist es, den Zugang zur KI-gestützten Bilderkennung so niedrigschwellig wie möglich zu gestalten. Die Anwendung basiert auf der Deep Java Library (DJL) und nutzt ein vortrainiertes Modell zur Bildklassifikation.

![alt text](<Bildschirmfoto 2025-05-12 um 13.16.18.png>)

Nach dem Hochladen wird das Bild analysiert und das Ergebnis in Form einer tabellarischen Übersicht präsentiert. Dabei werden die fünf wahrscheinlichsten Blumenkategorien zusammen mit ihrer jeweiligen Wahrscheinlichkeit ausgegeben. Die ermittelten Werte werden zusätzlich durch farbige Fortschrittsbalken visualisiert, was die Lesbarkeit erhöht und die Einschätzung erleichtert. Unterhalb der Auswertung wird das hochgeladene Bild nochmals dargestellt, sodass die Analyse eindeutig zugeordnet werden kann. Dieses interaktive Ergebnisformat schafft Transparenz und erhöht das Vertrauen in die Vorhersage.









