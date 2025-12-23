package com.pm.contractservice.service;

import com.pm.contractservice.dto.ContractRequestDTO;
import com.pm.contractservice.dto.ContractResponseDTO;
import com.pm.contractservice.dto.ContractViewDTO;
import com.pm.contractservice.dto.UserProfileDTO;
import com.pm.contractservice.grpc.ContractDataGrpcClient;
import com.pm.contractservice.grpc.UserServiceGrpcClient;
import com.pm.contractservice.mapper.ContractMapper;
import com.pm.contractservice.model.Contract;
import com.pm.contractservice.model.ContractStatus;
import com.pm.contractservice.model.ContractType;
import com.pm.contractservice.repository.ContractRepository;
import com.pm.contractservice.service.events.ContractEventPublisher;
import com.pm.contractservice.service.pdf.ContractPdfGenerator;
import com.pm.contractservice.validation.ContractValidator;
import org.springframework.stereotype.Service;
import user.UserDataResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final ContractValidator contractValidator;
    private final UserServiceGrpcClient userServiceGrpcClient;
    private final ContractEventPublisher contractEventPublisher;
    private final ContractPdfGenerator contractPdfGenerator;
    private final ContractDataGrpcClient contractDataGrpcClient;

    public ContractService(ContractRepository contractRepository,
                           ContractValidator contractValidator,
                           UserServiceGrpcClient userServiceGrpcClient,
                           ContractEventPublisher contractEventPublisher,
                           ContractPdfGenerator contractPdfGenerator,
                           ContractDataGrpcClient contractDataGrpcClient) {
        this.contractRepository = contractRepository;
        this.contractValidator = contractValidator;
        this.userServiceGrpcClient = userServiceGrpcClient;
        this.contractEventPublisher = contractEventPublisher;
        this.contractPdfGenerator = contractPdfGenerator;
        this.contractDataGrpcClient = contractDataGrpcClient;
    }

    public List<ContractResponseDTO> getContracts() {
        return contractRepository.findAll()
                .stream()
                .map(ContractMapper::toDTO)
                .toList();
    }

    public ContractResponseDTO createContract(ContractRequestDTO contractRequestDTO) {
        contractValidator.ensureNoContractForUser(UUID.fromString(contractRequestDTO.getUserId()));
        Contract contract = ContractMapper.toModel(contractRequestDTO);
        contract.setStatus(ContractStatus.DRAFT);
        contract = contractRepository.save(contract);
        contractEventPublisher.publishContractCreated(contract);
        return ContractMapper.toDTO(contract);
    }

    public ContractResponseDTO updateContract(UUID id, ContractRequestDTO contractRequestDTO) {
        Contract contract = contractValidator.getExistingContract(id);

        contract.setUserId(UUID.fromString(contractRequestDTO.getUserId()));
        contract.setStartDate(LocalDate.parse(contractRequestDTO.getStartDate()));
        contract.setEndDate(LocalDate.parse(contractRequestDTO.getEndDate()));
        contract.setContractType(ContractType.valueOf(contractRequestDTO.getContractType()));
        contract.setGrossHourlyWage(contractRequestDTO.getGrossHourlyWage());
        contract.setTravelAllowance(contractRequestDTO.getTravelAllowance());

        contract = contractRepository.save(contract);
        return ContractMapper.toDTO(contract);
    }

    public void deleteContract(UUID id) {
        contractValidator.getExistingContract(id);
        contractRepository.deleteById(id);
    }

    public ContractViewDTO getContractView(UUID contractId) {
        Contract contract = contractValidator.getExistingContract(contractId);
        UserDataResponse userData = userServiceGrpcClient.requestUserData(contract.getUserId().toString());

        UserProfileDTO profile = new UserProfileDTO();
        profile.setPreferredName(userData.getPreferredName());
        profile.setFirstNames(userData.getFirstNames());
        profile.setMiddleNamePrefix(userData.getMiddleNamePrefix());
        profile.setLastName(userData.getLastName());
        profile.setGender(userData.getGender());
        profile.setDateOfBirth(userData.getDateOfBirth());
        profile.setEmail(userData.getEmail());
        profile.setMobileNumber(userData.getMobileNumber());
        profile.setStreetName(userData.getStreetName());
        profile.setHouseNumber(userData.getHouseNumber());
        profile.setHouseNumberSuffix(userData.getHouseNumberSuffix());
        profile.setPostalCode(userData.getPostalCode());
        profile.setCity(userData.getCity());
        profile.setCountry(userData.getCountry());
        profile.setIban(userData.getIban());

        boolean previouslyWorked = contractRepository.existsByUserIdAndContractIdNot(
                contract.getUserId(),
                contract.getContractId()
        );

        ContractViewDTO view = new ContractViewDTO();
        view.setContractId(contract.getContractId());
        view.setUserId(contract.getUserId());
        view.setStartDate(contract.getStartDate());
        view.setEndDate(contract.getEndDate());
        view.setContractType(contract.getContractType());
        view.setStatus(contract.getStatus());
        view.setGrossHourlyWage(contract.getGrossHourlyWage());
        view.setTravelAllowance(contract.getTravelAllowance());
        view.setPreviouslyWorked(previouslyWorked);
        view.setUserProfile(profile);
        return view;
    }

    public ContractResponseDTO finalizeContract(UUID userId) {
        Contract contract = contractRepository.findByUserId(userId)
                .orElseThrow(() -> new com.pm.contractservice.exception.ContractNotFoundException(
                        "Contract for " + userId + " not found"));

        var contractData = contractDataGrpcClient.requestContractData(userId.toString());
        contract.setStartDate(LocalDate.parse(contractData.getStartDate()));
        contract.setEndDate(LocalDate.parse(contractData.getEndDate()));
        contract.setContractType(ContractType.valueOf(contractData.getContractType()));
        contract.setGrossHourlyWage(new java.math.BigDecimal(contractData.getGrossHourlyWage()));
        contract.setTravelAllowance(contractData.getTravelAllowance());

        UserDataResponse userData = userServiceGrpcClient.requestUserData(userId.toString());

        UserProfileDTO profile = new UserProfileDTO();
        profile.setPreferredName(userData.getPreferredName());
        profile.setFirstNames(userData.getFirstNames());
        profile.setMiddleNamePrefix(userData.getMiddleNamePrefix());
        profile.setLastName(userData.getLastName());
        profile.setGender(userData.getGender());
        profile.setDateOfBirth(userData.getDateOfBirth());
        profile.setEmail(userData.getEmail());
        profile.setMobileNumber(userData.getMobileNumber());
        profile.setStreetName(userData.getStreetName());
        profile.setHouseNumber(userData.getHouseNumber());
        profile.setHouseNumberSuffix(userData.getHouseNumberSuffix());
        profile.setPostalCode(userData.getPostalCode());
        profile.setCity(userData.getCity());
        profile.setCountry(userData.getCountry());
        profile.setIban(userData.getIban());

        byte[] pdfData = contractPdfGenerator.generate(contract, profile);
        contract.setPdfData(pdfData);
        contract.setStatus(ContractStatus.SIGNED);
        contract = contractRepository.save(contract);

        contractEventPublisher.publishEmployeeRegistered(contract, profile);

        return ContractMapper.toDTO(contract);
    }
}
