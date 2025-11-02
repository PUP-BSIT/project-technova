// Search/Filter DTOs
@Data
@NoArgsConstructor
@AllArgsConstructor
class FacilitySearchDTO {
    private String name;
    private String type;
    private String building;
    private Integer minCapacity;
    private String status;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class EquipmentSearchDTO {
    private String name;
    private String category;
    private String status;
    private Boolean availableOnly;
}