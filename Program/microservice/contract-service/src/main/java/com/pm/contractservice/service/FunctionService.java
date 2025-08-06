package com.pm.contractservice.service;

import com.pm.contractservice.dto.FunctionResponseDTO;
import com.pm.contractservice.mapper.FunctionMapper;
import com.pm.contractservice.model.Function;
import com.pm.contractservice.repository.FunctionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FunctionService {
    private final FunctionRepository functionRepository;

    public FunctionService(FunctionRepository functionRepository) {
        this.functionRepository = functionRepository;
    }

    public List<FunctionResponseDTO> getFunctions(){
        List<Function> function = functionRepository.findAll();
        return function.stream().map(FunctionMapper::toDTO).toList();
    }
}
