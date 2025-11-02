@Data
@NoArgsConstructor
@AllArgsConstructor
class DashboardStats {
    private Long activeReservations;
    private Long borrowedEquipment;
    private Long pendingRequests;
    private Long totalRequests;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class RecentRequest {
    private Long id;
    private String type; // "FACILITY" or "EQUIPMENT"
    private String name; // Facility or Equipment name
    private String category; // "Facility" or "Equipment"
    private String date;
    private String status;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class Dashboard {
    private DashboardStatsDTO stats;
    private List<RecentRequestDTO> recentRequests;
}