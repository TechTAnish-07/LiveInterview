package LiveInterview.example.LiveInterview.dsa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaBookmarkUpdateRequest {
    private Boolean bookmarked;
}
