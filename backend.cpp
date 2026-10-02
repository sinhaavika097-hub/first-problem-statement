#ifdef _WIN32
    #include <winsock2.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <unistd.h>
    #define SOCKET int
    #define closesocket close
#endif

#include <iostream>
#include <string>
#include <cstdlib>
#include <ctime>

// Global variable to track if the cooler is broken
bool isFailing = false;

// Generates temperature based on the cooler's status
float getTemperature() {
    if (isFailing) {
        // Danger zone: 12.0 to 15.0 degrees
        return 12.0 + static_cast<float>(rand()) / (static_cast<float>(RAND_MAX / 3.0)); 
    }
    // Safe zone: 2.0 to 8.0 degrees
    return 2.0 + static_cast<float>(rand()) / (static_cast<float>(RAND_MAX / 6.0)); 
}

int main() {
    srand(time(0));
#ifdef _WIN32
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif

    SOCKET server_fd = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(8080);

    bind(server_fd, (struct sockaddr*)&address, sizeof(address));
    listen(server_fd, 10);
    
    std::cout << "Backend running on http://localhost:8080\n";
    std::cout << "Trigger a breakdown by visiting http://localhost:8080/trigger\n";
    std::cout << "Reset the cooler by visiting http://localhost:8080/reset\n";

    while (true) {
        SOCKET client = accept(server_fd, nullptr, nullptr);
        char buffer[1024] = {0};
        recv(client, buffer, 1024, 0);
        
        std::string request(buffer);
        
        // Check if the frontend or user is triggering a breakdown
        if (request.find("GET /trigger") != std::string::npos) {
            isFailing = true;
            std::cout << "CRITICAL: Cooler breakdown triggered!\n";
        } 
        // Check if the cooler is being reset
        else if (request.find("GET /reset") != std::string::npos) {
            isFailing = false;
            std::cout << "Cooler reset to normal.\n";
        }

        std::string status = isFailing ? "DANGER" : "SAFE";
        std::string json = "{\"temperature\": " + std::to_string(getTemperature()) + ", \"status\": \"" + status + "\"}";
        
        std::string response = "HTTP/1.1 200 OK\r\n"
                               "Content-Type: application/json\r\n"
                               "Access-Control-Allow-Origin: *\r\n\r\n" + json;

        send(client, response.c_str(), response.length(), 0);
        closesocket(client);
    }
    return 0;
}