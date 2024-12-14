import axios from 'axios'
import localStorageService from '@/services/storage.service'

function getDomainName(): string {
  let storedDomainName = localStorageService.get<string>('domainName')
  let domainName = storedDomainName != '' ? storedDomainName : 'hifi-baby.local'
  return 'http://' + domainName + ':3000'
}

export const apiClient = axios.create({
  baseURL: getDomainName(),
  headers: {
    'Content-Type': 'application/json'
  }
})

export default function setBaseURL(newBaseURL: string) {
  apiClient.defaults.baseURL = 'http://' + newBaseURL + ':3000'
}