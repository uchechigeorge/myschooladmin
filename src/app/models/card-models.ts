export interface ICardDetail {
  showImage?: boolean,
  altImage?: 'text' | 'icon',
  imageText?: string,
  imageSrc?: string,
  details?: { [key: string]: string },
  cardData?: any,
  btnClick?: () => void,
}

export interface IFilterCard {
  filterTitle?: string,
  filterData?: ICardDetail[],
}

export const isDefaultImage = (imgSrc: string) => {
  return imgSrc.indexOf("files/dp/dp.png") != -1;
}