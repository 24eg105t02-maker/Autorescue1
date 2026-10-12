package com.autorescue.dto;

import jakarta.validation.constraints.Size;

public class CustomerDtos {

    public static class UpdateCustomerProfileRequest {
        @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
        private String fullName;

        @Size(min = 8, max = 20, message = "Phone number must be between 8 and 20 characters")
        private String phone;

        private String address;
        private String defaultVehicleMake;
        private String defaultVehicleModel;
        private String defaultVehicleRegistration;
        private String defaultVehicleType;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getDefaultVehicleMake() { return defaultVehicleMake; }
        public void setDefaultVehicleMake(String defaultVehicleMake) { this.defaultVehicleMake = defaultVehicleMake; }
        public String getDefaultVehicleModel() { return defaultVehicleModel; }
        public void setDefaultVehicleModel(String defaultVehicleModel) { this.defaultVehicleModel = defaultVehicleModel; }
        public String getDefaultVehicleRegistration() { return defaultVehicleRegistration; }
        public void setDefaultVehicleRegistration(String defaultVehicleRegistration) { this.defaultVehicleRegistration = defaultVehicleRegistration; }
        public String getDefaultVehicleType() { return defaultVehicleType; }
        public void setDefaultVehicleType(String defaultVehicleType) { this.defaultVehicleType = defaultVehicleType; }
    }
}
