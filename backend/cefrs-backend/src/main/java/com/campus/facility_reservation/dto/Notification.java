@Data
@NoArgsConstructor
@AllArgsConstructor
class Notification {
    private Long id;
    private String type;
    private String title;
    private String message;
    private Boolean isRead;
    private Long referenceId;
    private String referenceType;
    private String createdAt;
}