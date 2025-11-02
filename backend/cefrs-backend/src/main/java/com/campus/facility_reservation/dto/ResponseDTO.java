package com.campus.facility_reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic Data Transfer Object for wrapping all API responses
 * to ensure a consistent structure (data, message, success flag).
 *
 * @param <T> The type of the data payload.
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO<T> {

    // The main data payload of the response. Use a generic type T.
    private T data;
    
    // Status message for the response (e.g., "Success" or "Item not found").
    private String message;

    // Flag to indicate if the request was successful.
    private boolean success;

    /**
     * Factory method to create a successful response.
     * @param data The payload data to be returned.
     * @param message The success message (e.g., "Request successful").
     * @return A ResponseDTO object indicating success.
     */
    public static <T> ResponseDTO<T> success(T data, String message) {
        return new ResponseDTO<>(data, message, true);
    }

    /**
     * Factory method to create an error response.
     * @param message The error message (e.g., "User not found").
     * @return A ResponseDTO object indicating failure.
     */
    public static <T> ResponseDTO<T> error(String message) {
        // Data is null for error responses, success is false.
        return new ResponseDTO<>(null, message, false);
    }
}
