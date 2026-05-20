package com.pm.userservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.userservice.dto.CaoTemplateCreateDTO;
import com.pm.userservice.dto.CaoTemplateDTO;
import com.pm.userservice.dto.CaoVariableDTO;
import com.pm.userservice.model.CaoTemplate;
import com.pm.userservice.repository.CaoTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class CaoService {
    private static final TypeReference<List<CaoVariableDTO>> VARIABLE_LIST_TYPE = new TypeReference<>() {};

    private final CaoTemplateRepository caoTemplateRepository;
    private final ObjectMapper objectMapper;

    public CaoService(CaoTemplateRepository caoTemplateRepository, ObjectMapper objectMapper) {
        this.caoTemplateRepository = caoTemplateRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<CaoTemplateDTO> getCaoTemplates(UUID companyId) {
        return caoTemplateRepository.findAllByCompanyId(companyId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CaoTemplateDTO getCaoTemplateById(UUID caoId, UUID companyId) {
        CaoTemplate template = caoTemplateRepository.findByCaoIdAndCompanyId(caoId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("CAO template not found"));
        return toDTO(template);
    }

    @Transactional
    public CaoTemplateDTO createCaoTemplate(UUID companyId, CaoTemplateCreateDTO body) {
        String name = body.getName() == null ? "" : body.getName().trim();
        if (name.isBlank()) throw new IllegalArgumentException("CAO name is required");
        if (caoTemplateRepository.existsByNameAndCompanyId(name, companyId)) {
            throw new IllegalArgumentException("A CAO template with this name already exists");
        }

        CaoTemplate template = new CaoTemplate();
        template.setCaoId(UUID.randomUUID());
        template.setCompanyId(companyId);
        applyFields(template, body);

        return toDTO(caoTemplateRepository.save(template));
    }

    @Transactional
    public CaoTemplateDTO updateCaoTemplate(UUID caoId, UUID companyId, CaoTemplateCreateDTO body) {
        CaoTemplate template = caoTemplateRepository.findByCaoIdAndCompanyId(caoId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("CAO template not found"));

        String name = body.getName() == null ? "" : body.getName().trim();
        if (name.isBlank()) throw new IllegalArgumentException("CAO name is required");
        if (caoTemplateRepository.existsByNameAndCompanyIdAndCaoIdNot(name, companyId, caoId)) {
            throw new IllegalArgumentException("A CAO template with this name already exists");
        }

        applyFields(template, body);
        return toDTO(caoTemplateRepository.save(template));
    }

    @Transactional
    public void deleteCaoTemplate(UUID caoId, UUID companyId) {
        CaoTemplate template = caoTemplateRepository.findByCaoIdAndCompanyId(caoId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("CAO template not found"));
        caoTemplateRepository.delete(template);
    }

    private void applyFields(CaoTemplate template, CaoTemplateCreateDTO body) {
        template.setName(body.getName().trim());
        template.setSector(body.getSector() != null ? body.getSector().trim() : null);
        template.setEffectiveFrom(parseDate(body.getEffectiveFrom()));
        template.setEffectiveUntil(parseDate(body.getEffectiveUntil()));
        template.setVariablesJson(writeVariables(body.getVariables()));
    }

    CaoTemplateDTO toDTO(CaoTemplate template) {
        CaoTemplateDTO dto = new CaoTemplateDTO();
        dto.setCaoId(template.getCaoId() != null ? template.getCaoId().toString() : null);
        dto.setCompanyId(template.getCompanyId() != null ? template.getCompanyId().toString() : null);
        dto.setName(template.getName());
        dto.setSector(template.getSector());
        dto.setEffectiveFrom(template.getEffectiveFrom() != null ? template.getEffectiveFrom().toString() : null);
        dto.setEffectiveUntil(template.getEffectiveUntil() != null ? template.getEffectiveUntil().toString() : null);
        dto.setVariables(readVariables(template.getVariablesJson()));
        return dto;
    }

    private List<CaoVariableDTO> readVariables(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            List<CaoVariableDTO> list = objectMapper.readValue(json, VARIABLE_LIST_TYPE);
            return list != null ? list : List.of();
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private String writeVariables(List<CaoVariableDTO> variables) {
        if (variables == null || variables.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(variables);
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not serialize CAO variables");
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value.trim());
        } catch (Exception e) {
            return null;
        }
    }
}
