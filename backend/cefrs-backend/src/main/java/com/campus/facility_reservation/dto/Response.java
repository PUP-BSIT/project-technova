// Response DTOs

@Data
@NoArgsConstructor
@AllArgsConstructor
class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private String timestamp;
}