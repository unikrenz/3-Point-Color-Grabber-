#include <Wire.h>
#include "Adafruit_TCS34725.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <Servo.h>

byte multiAddress = 0x70;

#define TFT_CS   D8  // Pin for CS (Chip Select)
#define TFT_DC   D3  // Pin for DC (Data/Command)
#define TFT_RST  D4  // Pin for RST (Reset)
#define TFT_SDA  D7  // Pin for SDA (MOSI)
#define TFT_SCL  D5  // Pin for SCL (SCLK)

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);
Servo myServo;

Adafruit_TCS34725 tcs[] = {
    Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_1X),
    Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_1X),
    Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_1X)};

const char* ssid = "HUAWEI P30";
const char* password = "mojjo123";
const char* serverAddress = "192.168.43.50";
const int serverPort = 3000;

unsigned long lastUpdate = millis();
unsigned long lastReconnectAttempt = 0;
const unsigned long reconnectInterval = 5000; // 5 seconds

unsigned long previousMillis = 0;
const long interval = 1000; // Interval to send data (milliseconds)
const int servoDelay = 0; // Delay for servo movement

void sendDataToServer(byte sensorNum, uint8_t r, uint8_t g, uint8_t b) {
    DynamicJsonDocument jsonDoc(128);
    jsonDoc["sensorId"] = sensorNum;
    jsonDoc["r"] = r;
    jsonDoc["g"] = g;
    jsonDoc["b"] = b;
    String jsonString;
    serializeJson(jsonDoc, jsonString);
    Serial.print("Sending JSON: ");
    Serial.println(jsonString);
    HTTPClient http;
    String url = "http://" + String(serverAddress) + ":" + String(serverPort) + "/data";
    WiFiClient client;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonString);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    http.end();
}

void setup() {
    tft.initR(INITR_BLACKTAB);
    tft.setSPISpeed(8000000);
    tft.setRotation(3);
    Serial.begin(115200);
    Wire.begin();
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    for (int i = 0; i < 3; i++) {
        chooseBus(i);
        if (tcs[i].begin()) {
            Serial.print("Found sensor "); Serial.println(i);
        } else {
            Serial.println("No Sensor Found");
            while (true);
        }
    }
    myServo.attach(D0);
}

void loop() {
    // Rotate the servo from 0 to 180 degrees
    for (int angle = 0; angle <= 180; angle++) {
        myServo.write(angle);
        delay(servoDelay); 
        sendSensorData();
    }

    // Rotate the servo from 180 to 0 degrees
    for (int angle = 180; angle >= 0; angle--) {
        myServo.write(angle);
        delay(servoDelay); 
        sendSensorData();
    }
}

void sendSensorData() {
    // Read sensor data and send it to the server
    for (int i = 0; i < 3; i++) {
        uint16_t r, g, b, c;
        readColors(i, r, g, b, c);
        sendDataToServer(i, r, g, b);
        displayColorOnScreen(i, r, g, b);
    }
}

void readColors(byte sensorNum, uint16_t &r, uint16_t &g, uint16_t &b, uint16_t &c) {
    chooseBus(sensorNum);
    delay(50);
    tcs[sensorNum].getRawData(&r, &g, &b, &c);
    Serial.print("Channel: "); Serial.print(sensorNum); Serial.print(" - ");
    Serial.print("R: "); Serial.print(r, DEC); Serial.print(" ");
    Serial.print("G: "); Serial.print(g, DEC); Serial.print(" ");
    Serial.print("B: "); Serial.print(b, DEC); Serial.print(" ");
    Serial.print("C: "); Serial.print(c, DEC); Serial.print(" ");
    Serial.println(" ");
}

void displayColorOnScreen(byte sensorNum, uint16_t r, uint16_t g, uint16_t b) {
    // Clear the portion of the screen corresponding to the sensor
    int startX = sensorNum * (tft.width() / 3);
    int endX = startX + (tft.width() / 3);
    tft.fillRect(startX, 0, endX - startX, tft.height(), ST77XX_BLACK);
    
    // Display the color on the screen
    tft.fillRect(startX, 0, endX - startX, tft.height(), tft.color565(r, g, b));
}

void chooseBus(uint8_t bus) {
    Wire.beginTransmission(multiAddress);
    Wire.write(1 << bus);
    Wire.endTransmission();
}
