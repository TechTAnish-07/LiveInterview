package LiveInterview.example.LiveInterview.dsa.dto;

import LiveInterview.example.LiveInterview.dsa.entity.DsaStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaProgressUpdateRequest {
    private DsaStatus status;
    private String notes;
}
