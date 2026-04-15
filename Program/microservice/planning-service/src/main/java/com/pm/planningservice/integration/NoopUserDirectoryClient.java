package com.pm.planningservice.integration;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class NoopUserDirectoryClient implements UserDirectoryClient {
    @Override
    public Map<UUID, String> getDisplayNamesByUserIds(Set<UUID> userIds) {
        return Collections.emptyMap();
    }
}
