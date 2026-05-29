/*
 * Exemplo de código Arduino para Controle de Acesso RFID
 * 
 * Comunicação Serial com backend Node.js
 * Envia eventos em formato JSON e recebe comandos
 * 
 * Hardware sugerido:
 * - Arduino Uno / Mega
 * - Módulo RFID-RC522 (SPI)
 * - Servo motor ou relé para tranca
 * - Sensor magnético de porta (opcional)
 */

#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

// === Pinos RFID-RC522 ===
#define SS_PIN   10
#define RST_PIN  9
MFRC522 rfid(SS_PIN, RST_PIN);

// === Pino do Servo ===
#define SERVO_PIN 6
Servo tranca;

// === Pino do Sensor de Porta ===
#define SENSOR_PORTA 7

// === Configurações ===
const String DEVICE_ID = "ARDUINO-001";
const unsigned long DELAY_LEITURA = 500;

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();

  tranca.attach(SERVO_PIN);
  tranca.write(0); // Trancado

  pinMode(SENSOR_PORTA, INPUT_PULLUP);

  Serial.println("{\"event\":\"SISTEMA_INICIADO\",\"device_id\":\"" + DEVICE_ID + "\"}");
}

void loop() {
  // --- Leitura RFID ---
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uid = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      if (i > 0) uid += " ";
      if (rfid.uid.uidByte[i] < 0x10) uid += "0";
      uid += String(rfid.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();

    // Envia tag lida para o backend
    Serial.println("{\"event\":\"TAG_LIDA\",\"uid\":\"" + uid + "\",\"device_id\":\"" + DEVICE_ID + "\"}");

    rfid.PICC_HaltA();
    delay(DELAY_LEITURA);
  }

  // --- Sensor de Porta ---
  static int lastState = HIGH;
  int currentState = digitalRead(SENSOR_PORTA);
  if (currentState != lastState) {
    if (currentState == LOW) {
      Serial.println("{\"event\":\"PORTAO_ABERTO\",\"device_id\":\"" + DEVICE_ID + "\"}");
    } else {
      Serial.println("{\"event\":\"PORTAO_FECHADO\",\"device_id\":\"" + DEVICE_ID + "\"}");
    }
    lastState = currentState;
  }

  // --- Comandos do Backend ---
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando.indexOf("OPEN_GATE") >= 0) {
      tranca.write(90); // Destranca
      delay(3000);
      tranca.write(0);  // Trava novamente
      Serial.println("{\"event\":\"PORTAO_ABERTO\",\"device_id\":\"" + DEVICE_ID + "\"}");
    }
    else if (comando.indexOf("LOCK_GATE") >= 0) {
      tranca.write(0);
      Serial.println("{\"event\":\"PORTAO_FECHADO\",\"device_id\":\"" + DEVICE_ID + "\"}");
    }
  }
}
