// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

library Counters {
    struct Counter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function. As of Solidity v0.5.2, this cannot be enforced, though there is a proposal to add
        // this feature: see https://github.com/ethereum/solidity/issues/4637
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}

contract GradCertNFT is ERC721Enumerable, Ownable {
    // Token URI storage
    mapping(uint256 => string) private _tokenURIs;
    event CertificateIssued(address indexed to, uint256 indexed tokenId, string metadataURI);
    event CertificateRevoked(uint256 indexed tokenId);

    struct Certificate {
        uint256 tokenId;
        string metadataURI;
        bool isValid;
    }
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => bool) public validCertificates;
    mapping(address => bool) public hasCertificate;

    constructor(address initialOwner) ERC721("UniversityDegree", "UDC") Ownable(initialOwner) {}

    function issueDegree(address to, string memory metadataURI) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid student wallet");
        require(!hasCertificate[to], "Student already has a certificate");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        validCertificates[tokenId] = true;
        hasCertificate[to] = true;
        emit CertificateIssued(to, tokenId, metadataURI);
        return tokenId;
    }

    function isValidCertificate(uint256 tokenId) external view returns (bool) {
        return validCertificates[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        // ERC721._ownerOf is internal and accessible
        try this.ownerOf(tokenId) returns (address owner) {
            return owner != address(0);
        } catch {
            return false;
        }
    }


    // 👇 This override must match the parent class exactly
    // Soulbound token - prevent transfers
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 /*tokenId*/,
        uint256 /*batchSize*/
    ) internal virtual {
        require(from == address(0) || to == address(0), "Soulbound: Transfer not allowed");
        // Remove super call since we're fully overriding
    }

    // Token URI functionality
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    // Custom burn implementation without overriding parent
    function _burnCertificate(uint256 tokenId) private {
        // Call parent's internal _burn function
        ERC721._burn(tokenId);
        delete _tokenURIs[tokenId];
    }

    // Update revokeCertificate to use our custom burn
    function revokeCertificate(uint256 tokenId) external onlyOwner {
        emit CertificateRevoked(tokenId);
        require(_exists(tokenId), "Token does not exist");

        address ownerAddr = ownerOf(tokenId);
        hasCertificate[ownerAddr] = false;
        validCertificates[tokenId] = false;

        _burnCertificate(tokenId);
    }

    // Frontend helper functions
    function getOwnerCertificates(address owner) external view returns (Certificate[] memory) {
        uint256 balance = balanceOf(owner);
        Certificate[] memory certs = new Certificate[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            certs[i] = Certificate({
                tokenId: tokenId,
                metadataURI: tokenURI(tokenId),
                isValid: validCertificates[tokenId]
            });
        }
        return certs;
    }

    function getAllCertificates() external view onlyOwner returns (Certificate[] memory) {
        uint256 total = _tokenIdCounter.current();
        Certificate[] memory certs = new Certificate[](total);
        
        for (uint256 i = 1; i <= total; i++) {
            if (_exists(i)) {
                certs[i-1] = Certificate({
                    tokenId: i,
                    metadataURI: tokenURI(i),
                    isValid: validCertificates[i]
                });
            }
        }
        return certs;
    }

    function getCertificateDetails(uint256 tokenId) external view returns (Certificate memory) {
        require(_exists(tokenId), "Token does not exist");
        return Certificate({
            tokenId: tokenId,
            metadataURI: tokenURI(tokenId),
            isValid: validCertificates[tokenId]
        });
    }

    function getCertificateOwner(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return ownerOf(tokenId);
    }
}
