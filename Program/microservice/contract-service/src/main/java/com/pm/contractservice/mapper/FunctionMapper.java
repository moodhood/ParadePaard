package com.pm.contractservice.mapper;

import com.pm.contractservice.dto.FunctionResponseDTO;
import com.pm.contractservice.model.Function;

public class FunctionMapper {
    public static FunctionResponseDTO toDTO(Function function){
        FunctionResponseDTO functionResponseDTO = new FunctionResponseDTO();
        functionResponseDTO.setFunctionId(function.getFunctionId());

        functionResponseDTO.setFunctionName(function.getFunctionName());
        functionResponseDTO.setHourlyRate(function.getHourlyRate());

        return functionResponseDTO;
    }
}
